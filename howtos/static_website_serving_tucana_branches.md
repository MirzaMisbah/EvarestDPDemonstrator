# Serve Automatically Contents of Tucana Repo Branches

It is nice when developing new minions to be able to showcase your progress to someone. For this, it is nice to have a website, where one can watch over different branches in repository, the different versions of tucana, and minionis / functionality correspondingly.

To achieve this, a static website can be set up on a server, which constantly runs the `pull` command on all the branches of tucana.
 
Here, instructions are given on how to set up such website.

## Requirements

Set up ssh access for the server, so that `git pull` command runs withtout user input. See [here](https://github.com/InformationServiceSystems/tucana/blob/master/howtos/git_pull_no_login_prompt.md) for instructions.

## Instructions

1. Run the `misc/branches_to_folders.py` script as follows
```bash
python3 branches_to_folders.py $WEBROOT git@github.com:InformationServiceSystems/tucana.git
```
where `$WEBROOT` is a folder where the track of updates to git will be done.
2. Serve the content statically. Run the following:
```bash
cd $WEBROOT
http-server -p 5000
```
You can use other program to serve the website. Now you should be able to see most recent version
of tucana on `localhost:5000/$BRANCH/peer`, where `$BRANCH` is the branch you work on.

**IMPORTANT** Login on the `localhost:5000/master/peer` (master branch). Afterwards, you can view 
any other branch without getting error.
