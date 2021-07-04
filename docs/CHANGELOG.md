## 1.0.0 (2021-07-04)


### ⚠ BREAKING CHANGES

* **markdown output:** CHANGE
* CHANGE

Create is using TS syntax.
New interface in API types.
* **user|admin:** CHANGE

Update user admin file to TS
* **note intefaces:** CHANGE

Reorganized shared interfaces and typehints
* **note nav:** CHANGE

Update syntax to TS
* **worker:** CHANGE

Updated Note Worker to TypeScript
* **dexie:** CHANGE

noteDb is TS based
* **worker:** CHANGE

### Features

* **semantic-release:** add support for auto-releases ([d1aaeaf](https://github.com/shmolf/noted/commit/d1aaeaf6f71c03188451ef5d00448edc7bf2a65b))
* Added 'new note' button, and fixed new button showing in the list ([7a90b15](https://github.com/shmolf/noted/commit/7a90b157bcef6f73109f17d63a7bd27c23f1be44))
* **manifest:** added link to manifest and app icon ([76c3b76](https://github.com/shmolf/noted/commit/76c3b76b79e5889f68179a3056724b015f0bca6f))
* added support for checklists ([e040a22](https://github.com/shmolf/noted/commit/e040a22b69bdf8c25c816a5626d28aa53d48e111))
* **much:** bulk, iterative update to TS ([4644836](https://github.com/shmolf/noted/commit/4644836e3f65332ca596c6e4006982726c115ceb))
* **delete:** can successfully delete notes ([29286d7](https://github.com/shmolf/noted/commit/29286d7597e30f94cdb79b837df265f992e9d1a9))
* **markdown output:** convert to TS ([ebf87c2](https://github.com/shmolf/noted/commit/ebf87c25750b73b631d25ab437359ddc470252fb))
* **delete:** marginal support for deleting notes ([1459695](https://github.com/shmolf/noted/commit/1459695e25941ffe33ac24a3f698dd6fcbaa50d7))
* **dexie:** update db wrapper for TS ([709286d](https://github.com/shmolf/noted/commit/709286d5f6b416a17ba745860f416e1aa56e1a4c))
* Update Edit/Create files ([2aa8ccf](https://github.com/shmolf/noted/commit/2aa8ccfda4780093047de139d2a5d4c940947660))
* **note nav:** update to TS ([2674bf2](https://github.com/shmolf/noted/commit/2674bf2747216e18853b32cb8b938977ecd7cba6))
* **user|admin:** update to TS ([852164c](https://github.com/shmolf/noted/commit/852164c93be73fb5fb0dd7716204ec7e8523a807))
* **worker:** update worker for TS ([6aba100](https://github.com/shmolf/noted/commit/6aba1000086dff8e858819fc01647a11dd258c74))
* **worker:** updated worker to TS Format ([11ee854](https://github.com/shmolf/noted/commit/11ee85486e16acb9bdbb2cc6b6556d1cc7c1cd02))


### Bug Fixes

* **password-reset:** add csfr token check & improve other features ([1b49df5](https://github.com/shmolf/noted/commit/1b49df588528b6443f355a853be491b52b718482))
* **composer:** add description ([70c7528](https://github.com/shmolf/noted/commit/70c75286ec5917507ef25afdadc8c9f567ee78e0))
* **env:** add missing env variable ([5ed1870](https://github.com/shmolf/noted/commit/5ed187029a7c75e5a9f04d78c24cb57fc9390e96))
* **note worker:** cleanup ([09b7db5](https://github.com/shmolf/noted/commit/09b7db5139b4dea98b48da471e7372ab0e7d1ab4))
* **composer:** fix config errors & license field ([1482b71](https://github.com/shmolf/noted/commit/1482b711aa978f54a4b9d009d0af9d6a94e3d62a))
* **phpcs:** fix linting errors ([1941a7b](https://github.com/shmolf/noted/commit/1941a7be07295acfb8c0ed0843c2c0855b7df9c9))
* **notedb:** fix T type of table ([068c226](https://github.com/shmolf/noted/commit/068c2261d8eaf2915d5023fe41bfc8d92b988360))
* **delete:** fixed how the notes are deleted. ([97f127e](https://github.com/shmolf/noted/commit/97f127e61ded4cd992c0e708a0b43ef4953a2df2))
* fixed some presentational conflicts with Materialize ([c847e16](https://github.com/shmolf/noted/commit/c847e1692ae55db2e525199e9e5417cee4719d87))
* **cm:** iterative attempt ([60e2f46](https://github.com/shmolf/noted/commit/60e2f46ee66ee5321d9c14c7fce9a1941e542e78))
* **datetime:** move datetime type to shared space ([87e597e](https://github.com/shmolf/noted/commit/87e597efbbe9d0a63ba37228599758d4c64d1772))
* **nav:** position dynam-added nav button better ([06a2aaf](https://github.com/shmolf/noted/commit/06a2aafc07dc0b432963c2493d6113f07ec77f29))
* removed Eval call in JS & fixed CM Theme Select ([3491b79](https://github.com/shmolf/noted/commit/3491b792423c932fa2fa9d16a7f4dfbae5273576))
* **note intefaces:** update common note interfaces ([7d3e6d4](https://github.com/shmolf/noted/commit/7d3e6d4be363d9bf61a8bc2c850b38952ca4bb42))
* **manifest:** updated root path for public directory ([08b0247](https://github.com/shmolf/noted/commit/08b02472d2064d5ec1b355c6039dc2249993c61e))
* whitespace ([6bad9fb](https://github.com/shmolf/noted/commit/6bad9fb16ad8f2a802d0865dd28b59f40ae33300))
* **note nav:** whitespace ([81ff60d](https://github.com/shmolf/noted/commit/81ff60d5ab03e77889e17dc34c7d6876f86f7b6b))


### Reverts

* **cm:** switched back to CM5; fixed other bugs ([fca17ec](https://github.com/shmolf/noted/commit/fca17ec6e95870d12c8a72427011cc986572415c))
