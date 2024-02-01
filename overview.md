<p align="center">
  <img src="assets/testkube-logo.svg" alt="Testkube Logo" width="80"/>
</p>

<p align="center">
  Welcome to Testkube - Your friendly cloud-native testing framework for Kubernetes
</p>

<p align="center">
  <a href="https://testkube.io">Website</a> |
  <a href="https://kubeshop.github.io/testkube">Documentation</a> |
  <a href="https://twitter.com/testkube_io">Twitter</a> |
  <a href="https://discord.gg/hfq44wtR6Q">Discord</a> |
  <a href="https://kubeshop.io/category/testkube">Blog</a>
</p>

<p align="center">
  <img title="MIT license" src="https://img.shields.io/badge/License-MIT-yellow.svg"/>
</p>

<hr>

# Testkube Azure DevOps Extension

This is an Azure DevOps Extension for managing your Testkube installation.

Use it to install Testkube CLI to manage your resources, run tests and test suites, or anything else.

## Table of content

- [Testkube Azure DevOps Extension](#testkube-azure-devops-extension)
  - [Table of content](#table-of-content)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Testkube Pro](#testkube-pro)
    - [Self-hosted instance](#self-hosted-instance)
    - [Examples](#examples)
  - [Inputs](#inputs)
    - [Common](#common)
    - [Kubernetes (`kubectl`)](#kubernetes-kubectl)
    - [Pro and Enterprise](#pro-and-enterprise)


## Installation

// TODO: add link to extension

## Usage

### Testkube Pro

To use the Azure DevOps Extension for the [**Testkube Pro**](https://app.testkube.io), you need to [**create API token**](https://docs.testkube.io/testkube-pro/organization-management#api-tokens).

Then, pass the `TK_ORG` , `TK_ENV` and `TK_API_TOKEN` environment variables to configure the CLI. Additional parameters can be passed to the CLI directly based on your use case:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Test
  jobs:
  - job: RunTestkube
    steps:
      - task: SetupTestkube@1
        inputs:
          organization: '$(TK_ORG_ID)'
          environment: '$(TK_ENV_ID)'
          token: '$(TK_API_TOKEN)'
          url: '$(TK_URL)'
      - script: testkube run test test-name -f
        displayName: Trigger Testkube Test
```

Storing sensitive information directly in the workflow's YAML configuration is likely unsafe.  
Instead, it's recommended to utilize [**Variables**](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops).

### Self-hosted instance

To connect to the self-hosted instance, you need to have `kubectl` configured for accessing your Kubernetes cluster, and simply passing optional namespace, if the Testkube is not deployed in the default `testkube` namespace, i.e.:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Test
  jobs:
  - job: RunTestkube
    steps:
      - task: SetupTestkube@1
        inputs:
          namespace: 'custom-testkube-namespace'
          url: 'custom-url'
      - script: testkube run test test-name -f
        displayName: Trigger Testkube Test

```

### Examples


## Inputs

In addition to the common inputs, there are specific inputs for connecting to kubectl and Testkube Pro.

### Common

| Required | Name              | Description                                                                                                                  |
|:--------:|-------------------|------------------------------------------------------------------------------------------------------------------------------|
|    ✗     | `channel`      | Distribution channel to install the latest application from - one of `stable` or `beta` (default: `stable`)                     |
|    ✗     | `version`      | Static Testkube CLI version to force its installation instead of the latest                                                     |
|    ✗     | `debug`        | Set to "1" or "true" to print Java stack trace to the console output                                                            |

### Kubernetes (`kubectl`)

| Required | Name           | Description                                                                            |
|:--------:|----------------|----------------------------------------------------------------------------------------|
|    ✗     | `namespace`    | Set namespace where Testkube is deployed to (default: `testkube`)                   |

### Pro and Enterprise

| Required | Name           | Description                                                                                                                                                                                                                               |
|:--------:|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|    ✓     | `organization` | The organization ID from Testkube Pro or Enterprise - it starts with `tkc_org`, you may find it i.e. in the dashboard's URL                                                                                                             |
|    ✓     | `environment`  | The environment ID from Testkube Pro or Enterprise - it starts with `tkc_env`, you may find it i.e. in the dashboard's URL                                                                                                              |
|    ✓     | `token`        | API token that has at least a permission to run specific test or test suite. You may read more about [**creating API token**](https://docs.testkube.io/testkube-pro/organization-management#api-tokens) in Testkube Pro or Enterprise |
|    ✗     | `url`          | URL of the Testkube Enterprise instance, if applicable                                                                                                                                                                                    |