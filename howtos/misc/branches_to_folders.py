"""
Run this script similar to
python3 branches_to_folders.py /home/iaroslav/gitwebroot git@github.com:InformationServiceSystems/tucana.git
"""

import os
import re
from argparse import ArgumentParser

if __name__ == '__main__':
    parser = ArgumentParser(description="Clone all branches of git repository in folders, so that they can be served as a static website.")
    parser.add_argument("root", type=str, help="The folder where the the branches will be cloned.", default="~/gitwebroot")
    parser.add_argument("repo", type=str, help="Repository url that is to be cloned.", default="git@github.com:InformationServiceSystems/tucana.git")
    args = parser.parse_args()

    # this will be used as a root folder for all branches
    web_root = args.root
    repo_url = args.repo

    # ensure that the path for repository website exist
    if not os.path.exists(web_root):
        os.mkdir(web_root)

    def pull_clone(branch):
        branch_path = os.path.join(web_root, branch)
        if not os.path.exists(branch_path):
            os.system("cd " + web_root + " && git clone " + repo_url + " " + branch)
            os.popen("cd " + branch_path + " && git checkout " + branch).read()
        else:
            r = os.popen("cd " + branch_path + " && git pull").read()
            if not "up-to-date" in r:
                print(r)
        return branch_path

    # infinite loop of checking out
    while True:
        # get all branches in the master path
        master_path = pull_clone('master')
        refs = os.popen(("cd %s" % master_path) + "&& git show-ref").read()

        # get list of branches
        refs = re.findall(r"refs/remotes/origin.*", refs)
        refs = [r[len('refs/remotes/origin/'):] for r in refs]
        # remove HEAD branch
        refs = [r for r in refs if r != 'HEAD']

        # pull all the branches
        for r in refs:
            pull_clone(r)

        # remove the branches which are not used anymore
        dirs = os.listdir(web_root)

        refs += ['master']
        for dir in dirs:
            if not dir in refs:
                print('Warning: removing ' + dir)
                os.rmdir(os.path.join(web_root, dir))