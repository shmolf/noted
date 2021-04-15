<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class WelcomeController extends AbstractController
{
    public function __invoke(): Response
    {
        return $this->render('welcome.html.twig', [
        ]);
    }
}
