# Contributing

Contributions are **welcome** and will be fully **credited**.

We accept contributions via Pull Requests on [Github](https://github.com/shmolf/noted).

## Set Up
There seems to be a bug with PHP 8+, MySQL, and Doctrine. So you may get:
```
There is no active transaction
```

I needed to run the migration command several times before getting the green light
```shell
bin/console doctrine:migrations:migrate
```

- More context [found here](https://github.com/doctrine/migrations/issues/1202#issuecomment-945089795)

## Scripts

- ```shell
  yarn cz
  ```
   - This'll provide an interactive commandline UI, that'll help build the commit message that adheres
     to this application's commit message conventions.

- ```shell
  bin/console c:c
  ```
   - Good for clearing your Symfony cache

## Hooks
This project uses Husky for hooks. Please run `npx husky install` after cloning this repo.

## Pull Requests

- **[PSR-2 Coding Standard](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md)** - Check the code style with ``$ composer lint`` and fix it with ``$ composer fix-style``.

- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.

- **Create feature branches** - Don't ask us to pull from your master branch.

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.

- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](http://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.

**Happy coding**!
