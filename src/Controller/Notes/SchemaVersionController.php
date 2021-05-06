<?php

namespace App\Controller\Notes;

use shmolf\NotedHydrator\NoteHydrator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

class SchemaVersionController extends AbstractController
{
    public function __invoke(): JsonResponse
    {
        $hydrator = new NoteHydrator();
        return new JsonResponse($hydrator->getCompatibilityJsonResponse(), 200, [], true);
    }
}
