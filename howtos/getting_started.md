# Welcome to the Tucana team! :rocket: :sparkles:

This document provides a concise description of a workflow for Tucana development.

## Recommended software

* [git](https://git-scm.com/downloads) for command-line management of repository
* [GitKraken](https://www.gitkraken.com/) as a GUI and automation tool for git
* [Visual Code](https://code.visualstudio.com/download) for development and debugging of JavaScript
* Google Chrome for testing of your code

## How do I add or change code in Tucana?

It depends on the size of the change. If the change might require
discussion with other people, or it takes more than 30 min to add to the
repository, do it in the following steps:

1. Create a new [issue](https://github.com/InformationServiceSystems/tucana/issues) for the
changes that you want to introduce. This way, others can review and comment on your idea, even
before you make any code changes. Mention members of the team in the description of
issue which are most qualified to comment on idea.

2. If no objections are raised for the proposed change,
[make a new branch](https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches)
off the master branch. Make your changes there. This way, you cannot break the code in the
master branch, and thus interfere with someone else's work. Use your name and description of
what you do as a branch name.

3. Before making any changes to your branch, create [a new pull request](https://help.github.com/articles/creating-a-pull-request/)
to the master branch, and use "WIP" at the beginning of the title of the PR. Here WIP stands for Work in Progress,
and PR stands for Pull Request. Add description of your PR, and the estimated deadline for when it should be completed. Through open pull request, others can see your progress as well as
add comments to the changes that you make.

4. After you are done working on your change, add "MRG" (stands for Merge) to the title of the
pull request. This will signal to others that you are done with your changes. If someone needs to
review your changes, add them as reviewers for your PR - they can start their work. If any automated testing tools are
used in the repository, make sure that all the tests are passing. If your PR is ok, merge it.

5. You are done with this change. Excellent work!

If the change is small and is unlikely to break someone else's code, you can push directly to master,
as long as all the tests pass on your machine.

## How do I report bugs or discuss potential new features in Tucana?

By creation of a new [issue](https://github.com/InformationServiceSystems/tucana/issues) in the main repository! Please also add a deadline for when particular bugs / features should be resolved if possible.
