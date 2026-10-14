#!/usr/bin/env groovy

import groovy.xml.XmlSlurper
import java.nio.file.Files

// Delete old snapshot artifact files, keep only 1 snapshot.

def dryRun = !args.contains('-f')
def root = new File(args.last())

root.eachDirRecurse { File dir ->
    def metadataFile = new File(dir, "maven-metadata.xml")
    if (!metadataFile.exists()) return

    // Find metadata XMLs in snapshot directories
    def metadata = new XmlSlurper().parse(metadataFile)

    def version = metadata.version.text().trim()
    if (!version || !version.endsWith('-SNAPSHOT')) return

    def timestamp = metadata.versioning.snapshot.timestamp.text().trim()
    def buildNumber = metadata.versioning.snapshot.buildNumber.text().trim()
    def artifactId = metadata.artifactId.text().trim()

    if (!timestamp || !buildNumber || !artifactId) return

    version = version.replaceFirst(/-SNAPSHOT$/, "")

    // Delete files that match artifact ID and version, but not snapshot timestamp or build number
    dir.eachFile { File file ->
        if (
            file.name.startsWith("${artifactId}-${version}-") &&
            !file.name.startsWith("${artifactId}-${version}-${timestamp}-${buildNumber}.")
        ) {
            println file.path
            if (!dryRun) {
                Files.delete(file.toPath())
            }
        }
    }
}
