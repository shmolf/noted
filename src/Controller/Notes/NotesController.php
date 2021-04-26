<?php

namespace App\Controller\Notes;

use App\Entity\MarkdownNote;
use App\Entity\NoteTag;
use App\Entity\UserAccount;
use App\Repository\MarkdownNoteRepository;
use shmolf\NotedRequestHandler\NoteHydrator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class NotesController extends AbstractController
{
    public function getNoteList(): JsonResponse
    {
        /** @var UserAccount */
        $user = $this->getUser();
        $notes = $this->getDoctrine()
            ->getRepository(MarkdownNote::class)
            ->findBy(['userId' => $user->getId()]);

        $noteList = array_map(function(MarkdownNote $note) {
            return [
                'title' => $note->getTitle(),
                'tags' => array_map(function(NoteTag $tag) {
                        return $tag->getName();
                    }, $note->getTags()->toArray()),
                'noteUuid' => $note->getNoteUuid(),
                'clientUuid' => $note->getClientUuid(),
                'inTrashcan' => $note->getInTrashcan(),
            ];
        }, $notes);

        return new JsonResponse($noteList);
    }

    public function upsertNote(MarkdownNoteRepository $repo, Request $request): JsonResponse
    {
        $hydrator = new NoteHydrator();
        $noteJsonString = $request->getContent();
        $note = $hydrator->getHydratedNote($noteJsonString);
        $noteEntity = $repo->upsert($note, $this->getUser());

        return $this->json($noteEntity, 200, [], [
            'groups' => ['main'],
        ]);
    }
}
