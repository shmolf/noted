Doctrine Setup

Create a new Schema
```bash
echo "php bin/console doctrine:database:create"
```

Create a new Entity
```bash
php bin/console make:entity
```

Create the migration
```bash
php bin/console make:migration
```

Apply the Migration
```bash
php bin/console doctrine:migrations:migrate
```

@startuml
Bob -> Alice : hello
@enduml

```js
$(() => {
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  initCodeMirror();
  initMarkdownIt();
  $mdView.on('click', () => renderMarkdown());
});
```
