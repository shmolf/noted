# Note'd

The [note'd app](https://note-d.app) is a note-taking application, using the MarkDown syntax. There's added support,
for Graphs via [Apex Charts](https://github.com/smarthug/markdown-it-apexcharts#readme), and _some_ FrontMatter, via
custom implementation.

The end-goal, is that the application is broken up into 2 primary repos, with a third, independent
[repo for request hydration](https://github.com/shmolf/noted-hydrator). Ideally, this repo would be
responsible for the frontend presentation, and browser-side application. The other (tbd) repo would
house only the server-side logic for recieving and storing notes sent by the **note'd** website.

## Setup

Create an `.env.local` file, with the following environment variables (assign values according to your setup).
```ini
# This application uses Doctrine, so use a DSN that's compatible with that ORM. Doesn't have to be MySQL.
DATABASE_URL=mysql://someuser:somepassword@127.0.0.1:3306/databaseSchemaName?serverVersion=5.6
DATABASE_VERSION='5.6'
# use 'dev' for the APP_ENV if you're wanting Debugging capabilities. See Symfony docs for more info
APP_ENV=prod
APP_SECRET=yourApplicationSecret
```

``` bash
$ composer install;
yarn install;
cd node_modules/codemirror && yarn install && cd ../../;
yarn run build;
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for details.

Since this is still using the `codemirror` npm package, be sure to run the following command after you
install the package. This'll auto-generate the build files. Of course, this command is already referenced in [Setup](#setup).
```bash
cd node_modules/codemirror && yarn install
```

## Security

If you discover any security related issues, please email [the author](mailto:shmolf@gmail.com) instead of using the issue tracker.

## Credits

- [Nicholas Browning][link-author]
- [All Contributors][link-contributors]

## License
The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/shmolf
[link-contributors]: ../../contributors
