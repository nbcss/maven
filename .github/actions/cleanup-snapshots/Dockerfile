FROM docker.io/library/groovy:6-jdk21

COPY cleanup-snapshots.groovy /opt/

ENTRYPOINT ["groovy", "/opt/cleanup-snapshots.groovy"]
