pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "CheckBox"
include(":app")
include(":core")
include(":onboarding")
include(":onboarding:onboarding_presentation")
include(":onboarding:onboarding_domain")
include(":scan")
include(":box")
include(":box:box_presentation")
include(":box:box_domain")
include(":scan:scan_domain")
include(":scan:scan_presentation")
include(":scan:scan_data")
include(":box:box_data")

