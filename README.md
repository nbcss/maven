Maven repository.

[View contents](https://github.com/nbcss/maven/tree/contents)

Use with Gradle:

```groovy
repositories {
    maven {
        name = "nbcss GitHub"
        url = "https://nbcss.github.io/maven"
    }
}
```

Note to self: Use [setup-maven-repo](.github/actions/setup-maven-repo) and [push-maven-repo](.github/actions/push-maven-repo) actions to update.
