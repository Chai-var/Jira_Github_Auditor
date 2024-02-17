# Project Name
JIRA-GitHub Auditor

# Project Overview
## Introduction

Welcome to JIRA-GitHub Auditor, an innovative solution designed to streamline and secure the pull request review process by seamlessly integrating GitHub and JIRA. This project addresses the need for Project Managers to review GitHub pull requests directly from the JIRA interface, eliminating the necessity for granting unnecessary GitHub access.

## Key Features

1. Effortless Integration:
- Connect JIRA issues with corresponding GitHub pull requests effortlessly, creating a unified workflow.

2. Secure Review Process:
- Enable Project Managers to review pull requests within the familiar JIRA environment, minimizing exposure to unnecessary GitHub access.

3. Audit Trail Transparency:
- Maintain a robust and verifiable audit trail, ensuring compliance with audit requirements and providing a clear history of reviews and approvals.

4. Permission Control:
- Keep GitHub access limited to developers, enhancing security and ensuring that only essential team members have direct code access.

5. Custom Approval Process:
- Design and implement a customized approval process within JIRA, allowing for seamless collaboration and clear communication among team members.

## Problem Statement

Streamline pull request approval for project managers while ensuring auditability and eliminating the need for unnecessary GitHub licenses.

## Solution

Developed a workflow that integrates GitHub pull requests with a custom Jira issue type for approval tracking. This solution leverages automation and webhooks to:

- Create Jira issues automatically upon pull request creation in GitHub.
- Allow project managers to approve pull requests within Jira without granting them GitHub access.
- Post approval comments directly on the pull request in GitHub.

# Configurations
## GitHub:

- Create a GitHub Repository webhook, Specify the webhook URL to point to the Jira automation endpoint that captures PR details and subscribe to the Pull request event that occurs on GitHub.
- (Refer to this link to learn how to create a GitHub Webhook.)[https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks#creating-a-repository-webhook]

## Jira:

1. Custom Issue Type:

    - Issue types distinguish different types of work in unique ways, and help you identify, categorize, and report on your team’s work across your Jira site. They can help your team build more structure into your working process. 
    - To understand more on (issue-types)[https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/].
    - Issue type name: Approvals
    - Description: Approvals represents the GitHub Pull Request approval. This issue type will be for Project Managers/Approvers who are managing the GitHub Project outside of GitHub. An external approval taken from JIRA.
    - Fields:
        1. Description fields: These fields describe the work that needs to be done. They display prominently in most views.
            - Summary (Required): This is a mandatory field that provides a concise and clear overview of the issue. Ideally, it should be 255 characters or less for optimal readability. Think of it as a headline that captures the essence of the problem or task.
            - Description: This optional field allows for a more detailed explanation of the issue. Describe the symptoms, steps to reproduce, expected behavior, and any other relevant information that helps understand the problem and how to resolve it.
        2. Context Fields:These fields provide context to the work, and help group, filter, and report on similar issues.
            - Assignee: This field indicates the person responsible for working on the issue. Selecting an assignee improves accountability and helps track progress.
            - Labels: These user-defined keywords categorize issues for better organization and filtering. Use them to group related issues or indicate priority levels.
            - Parent: This field links the current issue to another related issue, often called a "subtask" or a "dependent issue." It helps clarify hierarchical relationships and dependencies.
            - Pull_Request_Number (Required): This custom field stores the unique identifier of the associated pull request in GitHub. 
        3. Reporter: This field shows the user who initially created the issue. It provides an audit trail and helps identify who raised the concern. This field is hidden when its empty.

2. Custom issue field:

    - In the above issue type, we have a context issue, 'Pull_Request_Number'. This is a custom issue type created to extract the pull request number from GitHub.
    - Here, I am using it to extract the PR number data from GitHub using Webhook data.
    - Refer to (Create a custom issue field)[https://support.atlassian.com/jira-cloud-administration/docs/create-a-custom-field/] to set up one in your JIRA project.

3. Automation rules:

    Rule 1: PM-Approval-in-JIRA
    - Trigger: GitHub Incoming webhook (Pull_request)[https://docs.github.com/en/webhooks/webhook-events-and-payloads#pull_request] event. This rule is triggerd whenever a Pull request activity occurs in GitHub.
    - Action 1: As soon as the rule is triggered, a log action is captured to display the Pull_request activities. For instance, Pull request assigned, auto merge disabled, auto merge enabled, closed, converted to draft, demilestoned, dequeued, edited, enqueued, labeled, locked, milestoned, opened, ready for review, reopened, review request removed, review requested, synchronized, unassigned, unlabeled, or unlocked.
    - IF condition: We set a condition to proceed further, only if the Pull_request activity is "opened".
    - Action 2: This action will 'Create an issue', whenever PR is opened:
        - Project: Specify the project name.
        - Issue type: Approvals
        - Choose a field to set: Assignee, Description
        - Summary* (required): Pull Request#{{webhookData.number}} for {{webhookData.repository.name}}
            - The above expression will create an issue in JIRA with a title that includes information about a specific GitHub pull request. The placeholders like {{webhookData.number}} and {{webhookData.repository.name}} will be dynamically replaced with actual data from the webhook payload when the automation rule is executed. 
        - Description: 
            '''
            {{webhookData.pull_request.user.login}} has created Pull Request
            #{{webhookData.number}} for {{webhookData.repository.name}}
            Link to Pull request {{webhookData.pull_request.html_url}}
            {{webhookData.pull_request.body}}
            '''
            - The above snippet retrieves information regarding the GitHub PR :
                - Username: {{webhookData.pull_request.user.login}} indicates the GitHub username of the user who created the pull request.
                - Pull Request Details:
                - Number: #{{webhookData.number}} represents the pull request number.
                - Repository: {{webhookData.repository.name}} provides the name of the GitHub repository.
                - Pull Request Link: {{webhookData.pull_request.html_url}} generates a link to the pull request on GitHub.
                - Body: {{webhookData.pull_request.body}} likely contains the body or description of the pull request.

        - Assignee: The Project Manager.
        - Additional fields:
            '''
                        {
                "fields": {
                    "labels": [
                        "PM_Approval",
                        "GitHub_PR"
                    ],
                "customfield_10036": "{{webhookData.number}}"
                }
            }
            '''
            - The above JSON data, provides the other issue fields: Labels and Pull_Request_number.
            - fields: This is an object containing various fields related to a JIRA issue.
            - labels: An array of labels associated with the JIRA issue. In this case, it includes two labels: "PM_Approval" and "GitHub_PR." Labels are often used to categorize or tag issues.
            - customfield_10036: This is the custom field 'Pull_Request_number' ID. It holds the value {{webhookData.number}}. This appears to be a placeholder that will be replaced with the actual pull request number when this JSON payload is processed. The use of double curly braces ({{ ... }}) suggests that it is a template variable or placeholder to be filled in dynamically.

    Rule 2: Approved-comment-updation
    - Trigger: (Issue Transitioned)[https://support.atlassian.com/cloud-automation/docs/transition-an-issue-with-automation/], from 'Approval In-progress' to 'Approval done'.
    - Action 1: Send web request, This action will send a HTTP request to the url specified.
        - Web request URL* (required): https://api.github.com/repos/Chai-var/Jira_Github_Auditor/issues/{{issues.fields.Pull_Request_Number}}/comments
            - Base URL: https://api.github.com: This is the base URL for GitHub's REST API.
            - Repository Path: repos/Chai-var/Jira_Github_Auditor: This specifies the path to the repository "Chai-var/Jira_Github_Auditor" on GitHub.
            - Issue URL Path: issues/{{issues.fields.Pull_Request_Number}}: This part of the URL is related to a specific issue or pull request. The {{issues.fields.Pull_Request_Number}} placeholder suggests that it's expecting a dynamic value, likely the pull request number, to be filled in when making the actual API request.
            - Comments URL Path: /comments: This indicates that the API request is targeting comments associated with the specified issue or pull request.
        - HTTP method* (required): POST
        - Web request body* (required): Custom data
        - Custom data* (required):
        '''
        {
        "body": "{{issue.assignee.displayName}} Approved this PR"
        }
        '''
        - Headers (optional):
            | Key                    | Value                             |
            | ---------------------- | --------------------------------- |
            | Authorization          | `<GitHub-repo-admin-PAT-token>`   |
            | Accept                 | `application/vnd.github+json`     |
            | X-GitHub-Api-Version   | `28-11-2022`                      |



