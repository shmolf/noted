<?php

namespace App\Controller\Notes;

use App\Entity\UserAccount;
use App\Entity\Workspace;
use App\Repository\MarkdownNoteRepository;
use Exception;
use shmolf\NotedHydrator\NoteHydrator;
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

    public function upsertNote(string $uuid, MarkdownNoteRepository $repo, Request $request): JsonResponse
    {
        $hydrator = new NoteHydrator();
        $noteJsonString = $request->getContent();
        $note = $hydrator->getHydratedNote($noteJsonString);
        if ($note === null) {
            throw new Exception("Could not hydrate note with given JSON:\n{$noteJsonString}");
        }

        $noteEntity = $repo->upsert($uuid, $note, $this->getUser());

        return $this->json($noteEntity, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function deleteNoteByUuid(string $uuid, MarkdownNoteRepository $repo): JsonResponse
    {
        $didDelete = $repo->delete($uuid, $this->getUser());

        return new JsonResponse(null, ($didDelete ? 200 : 404));
    }
}
