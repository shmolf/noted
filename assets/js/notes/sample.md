---
title: This is an Example
greeting: hello 🧛‍♂️
fruits:
   - apple
   - banana
person:
   name: Sorjan
   class: Rogue
---

## Why, {{ page.greeting }}!
I didn't realize we had a {{ page.person.class }} in our midst.  
Please, why don't you sit down, {{ page.person.name }}, and and enjoy a delicious {{ page.fruits[0] }}.

Doctrine Setup

1. Create a new Schema
```bash
echo "php bin/console doctrine:database:create"
```
2. Create a new Entity
```bash
php bin/console make:entity
```
3. Create the migration
```bash
php bin/console make:migration
```
4. Apply the Migration
```bash
php bin/console doctrine:migrations:migrate
```

---

```js
const lennys = {
    סּ_סּ : 'stern look',
    ᓬᗽᗳ : 'rabbit',
    ʢᵕᴗᵕʡ : 'koala bear',

};

const TheLenny = Object.keys(lennys)
    .reduce((lastLenny, lenny) => Math.random().floor() === 0 ? lastLenny: lenny, 'ಠ_ಠ');
```

---

For more Apex example: https://apexcharts.com/javascript-chart-demos/

```apex
{
    "chart": {
        "type": "area"
    },
    "series": [{
        "name": "sales",
        "data": [30,40,45,50,49,60,70,91,125]
    }],
    "xaxis": {
        "type": "datetime",
        "categories": ["01/01/1991","01/01/1992","01/01/1993","01/01/1994","01/01/1995","01/01/1996","01/01/1997", "01/01/1998","01/01/1999"]
    }
}
```
