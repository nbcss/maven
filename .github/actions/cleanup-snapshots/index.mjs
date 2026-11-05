import fs from 'node:fs/promises';
import path from 'node:path';
import core from '@actions/core';
import { XMLParser } from 'fast-xml-parser';

// Delete old Maven snapshot files.

(async function() {
  const rootDir = core.getInput('path', { required: true });
  const dryRun = core.getInput('dry-run');
  await fs.stat(rootDir);
  const parser = new XMLParser({
    parseTagValue: false, trimValues: true,
    isArray: (tag) => ['snapshotVersion'].includes(tag),
  });

  for await (const metadataPath of fs.glob('**/maven-metadata.xml', { cwd: rootDir, followSymlinks: true })) {
    // Parse Maven metadata XML of snapshot versions.
    const metadataFile = path.join(rootDir, metadataPath);
    const { metadata } = parser.parse(await fs.readFile(metadataFile, 'utf8'));

    const version = metadata?.version;
    if (!version?.endsWith('-SNAPSHOT')) continue;

    const artifactId = metadata.artifactId;
    const snapshotVersions = metadata.versioning?.snapshotVersions?.snapshotVersion;
    if (!artifactId || !snapshotVersions) continue;

    const allowedFileNames = snapshotVersions.map(sv =>
      `${artifactId}-${sv.value}${sv.classifier?.replace('', '-') || ''}${sv.extension?.replace('', '.') || ''}`
    );

    // Delete files that matches artifact name, but is not listed in snapshotVersions.
    const directory = path.dirname(metadataFile);
    for (const entry of await fs.readdir(directory)) {
      if (
        entry.startsWith(`${artifactId}-`) &&
        !allowedFileNames.some(allowed => entry == allowed || entry.startsWith(allowed + '.'))
      ) {
        const file = path.join(directory, entry);
        core.info(file);
        if (!dryRun) {
          await fs.rm(file, { recursive: true });
        }
      }
    }
  }

})().catch(error => core.setFailed(error));
