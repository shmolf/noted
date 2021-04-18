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

```js
$(() => {
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  initCodeMirror();
  initMarkdownIt();
  $mdView.on('click', () => renderMarkdown());
});
```
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

```apex
{
  "chart": {
    "type": "radar"
  },
  "series": [{
    "name": "Series1",
    "data": [80,50,30,40,100,20]
  }],
  "title": {
    "text": "BasicRadarChart"
  },
  "xaxis": {
    "categories": ["January","February","March","April","May","June"]
  }
}
```

```apex
{
   "series":[
      14,
      23,
      21,
      17,
      15,
      10,
      12,
      17,
      21
   ],
   "chart":{
      "type":"polarArea"
   },
   "stroke":{
      "colors":[
         "#fff"
      ]
   },
   "fill":{
      "opacity":0.8
   },
   "responsive":[
      {
         "breakpoint":480,
         "options":{
            "chart":{
               "width":200
            },
            "legend":{
               "position":"bottom"
            }
         }
      }
   ]
}
```

```apex
{
   "series":[
      67
   ],
   "chart":{
      "height":350,
      "type":"radialBar"
   },
   "plotOptions":{
      "radialBar":{
         "hollow":{
            "margin":15,
            "size":"70%",
            "image":"https://shmolf.com/images/bground/campfire.gif",
            "imageWidth":164,
            "imageHeight":164,
            "imageClipped":true
         },
         "dataLabels":{
            "name":{
               "show":false,
               "color":"#fff"
            },
            "value":{
               "show":true,
               "color":"#fff",
               "offsetY":70,
               "fontSize":"22px"
            }
         }
      }
   },
   "fill":{
      "type":"image",
      "image":{
         "src":[
            "https://shmolf.com/images/bground/cluttered_room.gif"
         ]
      }
   },
   "stroke":{
      "lineCap":"round"
   },
   "labels":[
      "Volatility"
   ]
}
```

Visit (https://markvis.js.org/#/?id=usage) for usage instructions.

```vis
layout: bar
data: [
{ key: 0, value: 5 },
{ key: 1, value: 4 },
{ key: 2, value: 7 },
{ key: 3, value: 2 },
{ key: 4, value: 4 },
{ key: 5, value: 8 },
{ key: 6, value: 3 },
{ key: 7, value: 6 }
]
```

```vis
layout: line
data: [
{ key: 0, value: 45 },
{ key: 1, value: 100 },
{ key: 2, value: 70 },
{ key: 3, value: 20 },
{ key: 4, value: 30 },
{ key: 5, value: 80 },
{ key: 6, value: 10 },
{ key: 7, value: 60 }
]
```
