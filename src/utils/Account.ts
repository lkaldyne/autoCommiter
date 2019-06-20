import path from 'path';
import FileUtils from './FileUtils';
import { repoPath, commitFile, repoUrl } from '../index';

const git = require('simple-git/promise');
const rmdir = require('rmdir');

export interface IAccountInfo {
    email: string,
    ghPersonalKey: string,
}

export default class Account {
    private remote: string;

    private info: IAccountInfo;

    private maxNumberOfCommitsPerDay: number;

    private commitDaysPerWeek: number;

    constructor(info: IAccountInfo) {
      this.info = info;
      this.remote = `https://${this.info.ghPersonalKey}@${repoUrl}`;
    }

    public clone(callback: (err?: string) => void): void {
      git()
        .silent(true)
        .clone(this.remote)
        .then(() => {
          callback();
        })
        .catch((error: any) => {
          callback(error);
        });
    }

    public stage(callback: (err?: string) => void) {
      git(repoPath)
        .silent(true)
        .add([commitFile])
        .then(() => {
          callback();
        })
        .catch((error: any) => {
          callback(error);
        });
    }

    public alterFile(callback: (err?: string) => void): void {
      FileUtils.createCommitDiff(path.join(repoPath, commitFile), (err: any) => {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    }

    public commit(callback: (err?: string) => void) {
      git(repoPath)
        .silent(true)
        .commit('commit', {
          '--author': `test<${this.info.email}>`,
        })
        .then(() => {
          callback();
        })
        .catch((error: any) => {
          callback(error);
        });
    }

    public push(callback: (err?: string) => void) {
      git(repoPath)
        .silent(true)
        .push(this.remote, 'master')
        .then(() => {
          callback();
        })
        .catch((error: any) => {
          callback(error);
        });
    }

    public removeRepo(callback: (err?: string) => void) {
      rmdir(repoPath, () => {
        callback();
      });
    }

    public shouldTheyCommitToday(): boolean {
      return ((this.commitDaysPerWeek / 7) >= Math.random());
    }

    public getNumberOfCommits(): number {
      return (this.maxNumberOfCommitsPerDay * Math.random());
    }
}
