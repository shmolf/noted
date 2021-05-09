<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

class WelcomeController extends AbstractController
{
    public function __invoke(Request $request): Response
    {
        $selectedPageTheme = $request->cookies->get('page-theme') ?? 'auto';
        $pageThemes = $this->getPageThemes();
        $pageThemes[$selectedPageTheme]['isSelected'] = true;

        $selectedHljsTheme = $request->cookies->get('hljs-theme') ?? 'default';
        $highlightJsThemes = $this->getHighlightJsThemes();
        $highlightJsThemes[$selectedHljsTheme]['isSelected'] = true;

        return $this->render('welcome.html.twig', [
            'pageTheme' => $request->cookies->get('page-theme') ?? 'auto',
            'pageThemes' => $pageThemes,
            'highlightJsThemes' => $highlightJsThemes,
        ]);
    }

    private function getPageThemes(): array
    {
        return [
            'auto' => [
                'name' => 'OS System',
                'isSelected' => false,
            ],
            'light' => [
                'name' => 'Light',
                'isSelected' => false,
            ],
            'mid' => [
                'name' => 'Medium',
                'isSelected' => false,
            ],
            'dark' => [
                'name' => 'Dark',
                'isSelected' => false,
            ],
        ];
    }

    private function getHighlightJsThemes(): array
    {
        return [
            'a11y-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/a11y-dark.min.css',
                'isSelected' => false,
            ],
            'a11y-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/a11y-light.min.css',
                'isSelected' => false,
            ],
            'agate' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/agate.min.css',
                'isSelected' => false,
            ],
            'an-old-hope' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/an-old-hope.min.css',
                'isSelected' => false,
            ],
            'androidstudio' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/androidstudio.min.css',
                'isSelected' => false,
            ],
            'arduino-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/arduino-light.min.css',
                'isSelected' => false,
            ],
            'arta' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/arta.min.css',
                'isSelected' => false,
            ],
            'ascetic' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/ascetic.min.css',
                'isSelected' => false,
            ],
            'atelier-cave-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-cave-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-cave-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-cave-light.min.css',
                'isSelected' => false,
            ],
            'atelier-dune-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-dune-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-dune-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-dune-light.min.css',
                'isSelected' => false,
            ],
            'atelier-estuary-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-estuary-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-estuary-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-estuary-light.min.css',
                'isSelected' => false,
            ],
            'atelier-forest-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-forest-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-forest-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-forest-light.min.css',
                'isSelected' => false,
            ],
            'atelier-heath-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-heath-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-heath-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-heath-light.min.css',
                'isSelected' => false,
            ],
            'atelier-lakeside-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-lakeside-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-lakeside-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-lakeside-light.min.css',
                'isSelected' => false,
            ],
            'atelier-plateau-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-plateau-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-plateau-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-plateau-light.min.css',
                'isSelected' => false,
            ],
            'atelier-savanna-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-savanna-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-savanna-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-savanna-light.min.css',
                'isSelected' => false,
            ],
            'atelier-seaside-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-seaside-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-seaside-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-seaside-light.min.css',
                'isSelected' => false,
            ],
            'atelier-sulphurpool-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-sulphurpool-dark.min.css',
                'isSelected' => false,
            ],
            'atelier-sulphurpool-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atelier-sulphurpool-light.min.css',
                'isSelected' => false,
            ],
            'atom-one-dark-reasonable' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark-reasonable.min.css',
                'isSelected' => false,
            ],
            'atom-one-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css',
                'isSelected' => false,
            ],
            'atom-one-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-light.min.css',
                'isSelected' => false,
            ],
            'brown-paper' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/brown-paper.min.css',
                'isSelected' => false,
            ],
            'codepen-embed' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/codepen-embed.min.css',
                'isSelected' => false,
            ],
            'color-brewer' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/color-brewer.min.css',
                'isSelected' => false,
            ],
            'darcula' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/darcula.min.css',
                'isSelected' => false,
            ],
            'dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/dark.min.css',
                'isSelected' => false,
            ],
            'default' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/default.min.css',
                'isSelected' => false,
            ],
            'docco' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/docco.min.css',
                'isSelected' => false,
            ],
            'dracula' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/dracula.min.css',
                'isSelected' => false,
            ],
            'far' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/far.min.css',
                'isSelected' => false,
            ],
            'foundation' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/foundation.min.css',
                'isSelected' => false,
            ],
            'github-gist' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github-gist.min.css',
                'isSelected' => false,
            ],
            'github' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github.min.css',
                'isSelected' => false,
            ],
            'gml' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/gml.min.css',
                'isSelected' => false,
            ],
            'googlecode' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/googlecode.min.css',
                'isSelected' => false,
            ],
            'gradient-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/gradient-dark.min.css',
                'isSelected' => false,
            ],
            'gradient-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/gradient-light.min.css',
                'isSelected' => false,
            ],
            'grayscale' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/grayscale.min.css',
                'isSelected' => false,
            ],
            'gruvbox-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/gruvbox-dark.min.css',
                'isSelected' => false,
            ],
            'gruvbox-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/gruvbox-light.min.css',
                'isSelected' => false,
            ],
            'hopscotch' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/hopscotch.min.css',
                'isSelected' => false,
            ],
            'hybrid' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/hybrid.min.css',
                'isSelected' => false,
            ],
            'idea' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/idea.min.css',
                'isSelected' => false,
            ],
            'ir-black' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/ir-black.min.css',
                'isSelected' => false,
            ],
            'isbl-editor-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/isbl-editor-dark.min.css',
                'isSelected' => false,
            ],
            'isbl-editor-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/isbl-editor-light.min.css',
                'isSelected' => false,
            ],
            'kimbie.dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/kimbie.dark.min.css',
                'isSelected' => false,
            ],
            'kimbie.light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/kimbie.light.min.css',
                'isSelected' => false,
            ],
            'lightfair' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/lightfair.min.css',
                'isSelected' => false,
            ],
            'lioshi' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/lioshi.min.css',
                'isSelected' => false,
            ],
            'magula' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/magula.min.css',
                'isSelected' => false,
            ],
            'mono-blue' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/mono-blue.min.css',
                'isSelected' => false,
            ],
            'monokai-sublime' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/monokai-sublime.min.css',
                'isSelected' => false,
            ],
            'monokai' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/monokai.min.css',
                'isSelected' => false,
            ],
            'night-owl' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/night-owl.min.css',
                'isSelected' => false,
            ],
            'nnfx-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/nnfx-dark.min.css',
                'isSelected' => false,
            ],
            'nnfx' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/nnfx.min.css',
                'isSelected' => false,
            ],
            'nord' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/nord.min.css',
                'isSelected' => false,
            ],
            'obsidian' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/obsidian.min.css',
                'isSelected' => false,
            ],
            'ocean' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/ocean.min.css',
                'isSelected' => false,
            ],
            'paraiso-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/paraiso-dark.min.css',
                'isSelected' => false,
            ],
            'paraiso-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/paraiso-light.min.css',
                'isSelected' => false,
            ],
            'pojoaque' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/pojoaque.min.css',
                'isSelected' => false,
            ],
            'purebasic' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/purebasic.min.css',
                'isSelected' => false,
            ],
            'qtcreator_dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/qtcreator_dark.min.css',
                'isSelected' => false,
            ],
            'qtcreator_light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/qtcreator_light.min.css',
                'isSelected' => false,
            ],
            'railscasts' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/railscasts.min.css',
                'isSelected' => false,
            ],
            'rainbow' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/rainbow.min.css',
                'isSelected' => false,
            ],
            'routeros' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/routeros.min.css',
                'isSelected' => false,
            ],
            'school-book' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/school-book.min.css',
                'isSelected' => false,
            ],
            'shades-of-purple' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/shades-of-purple.min.css',
                'isSelected' => false,
            ],
            'solarized-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/solarized-dark.min.css',
                'isSelected' => false,
            ],
            'solarized-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/solarized-light.min.css',
                'isSelected' => false,
            ],
            'srcery' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/srcery.min.css',
                'isSelected' => false,
            ],
            'stackoverflow-dark' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/stackoverflow-dark.min.css',
                'isSelected' => false,
            ],
            'stackoverflow-light' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/stackoverflow-light.min.css',
                'isSelected' => false,
            ],
            'sunburst' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/sunburst.min.css',
                'isSelected' => false,
            ],
            'tomorrow-night-blue' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/tomorrow-night-blue.min.css',
                'isSelected' => false,
            ],
            'tomorrow-night-bright' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/tomorrow-night-bright.min.css',
                'isSelected' => false,
            ],
            'tomorrow-night-eighties' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/tomorrow-night-eighties.min.css',
                'isSelected' => false,
            ],
            'tomorrow-night' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/tomorrow-night.min.css',
                'isSelected' => false,
            ],
            'tomorrow' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/tomorrow.min.css',
                'isSelected' => false,
            ],
            'vs' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/vs.min.css',
                'isSelected' => false,
            ],
            'vs2015' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/vs2015.min.css',
                'isSelected' => false,
            ],
            'xcode' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/xcode.min.css',
                'isSelected' => false,
            ],
            'xt256' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/xt256.min.css',
                'isSelected' => false,
            ],
            'zenburn' => [
                'url' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/zenburn.min.css',
                'isSelected' => false,
            ],
        ];
    }
}
