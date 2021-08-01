<?php

namespace App\Controller\Notes;

use App\Entity\UserAccount;
use App\Entity\Workspace;
use App\Repository\WorkspaceRepository;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class WorkspaceController extends AbstractController
{
    public function getWorkspaceByUuid(string $uuid): JsonResponse
    {
        /** @var UserAccount */
        $user = $this->getUser();
        $workSpaces = $user->getWorkspaces()->toArray();
        /** @var Workspace|false */
        $workSpace = current(array_filter($workSpaces, fn(Workspace $workspace) => $workspace->getUuid() === $uuid));

        if ($workSpace === false) {
            return new JsonResponse(null, Response::HTTP_NOT_FOUND);
        }

        return $this->json($workSpace, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function updateWorkspaceByUuid(string $uuid, Request $request, LoggerInterface $logger): JsonResponse
    {
        $newToken = $request->request->get('token');
        $expiration = $request->request->get('expiration');

        if (trim($expiration ?? '') === '') return new JsonResponse(['Missing Expiration'], Response::HTTP_BAD_REQUEST);
        if (trim($newToken ?? '') === '') return new JsonResponse(['Missing Token'], Response::HTTP_BAD_REQUEST);

        /** @var UserAccount */
        $user = $this->getUser();
        $workSpaces = $user->getWorkspaces()->toArray();
        /** @var Workspace|false */
        $workSpace = current(array_filter($workSpaces, fn(Workspace $workspace) => $workspace->getUuid() === $uuid));

        if ($workSpace === false) return new JsonResponse(null, Response::HTTP_NOT_FOUND);

        $workSpace->setToken($newToken);
        $workSpace->setTokenExpiration($expiration);

        try {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($workSpace);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            $logger->error($e->getMessage(), $e->getTrace());
        }

        return $this->json($workSpace, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function workspaceDelete(string $uuid, WorkspaceRepository $repository): Response
    {
        $didDelete = $repository->delete($uuid, $this->getUser());
        return new JsonResponse(null, ($didDelete ? 200 : 404));
    }
}
