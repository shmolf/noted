<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

class WelcomeController extends AbstractController
{
    public function __invoke(Request $request): Response
    {
        return $this->render('welcome.html.twig', [
        ]);
    }
}
