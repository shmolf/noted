<?php

namespace App\Controller\Notes;

use App\Entity\MarkdownNote;
use App\Entity\NoteTag;
use App\Entity\UserAccount;
use App\Repository\MarkdownNoteRepository;
use Exception;
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
            ->findBy(['userId' => $user->getId()], ['lastModified' => 'DESC']);

        $noteList = array_map(function(MarkdownNote $note) {
            return [
                'title' => $note->getTitle(),
                'tags' => array_map(function(NoteTag $tag) {
                        return $tag->getName();
                    }, $note->getTags()->toArray()),
                'clientUuid' => $note->getClientUuid(),
                'inTrashcan' => $note->getInTrashcan(),
                'createdDate' => $note->getCreatedDate(),
                'lastModified' => $note->getLastModified(),
            ];
        }, $notes);

        return new JsonResponse($noteList);
    }

    public function getNoteByClientUuid(string $uuid): JsonResponse
    {
        /** @var UserAccount */
        $user = $this->getUser();
        $note = $this->getDoctrine()
            ->getRepository(MarkdownNote::class)
            ->findOneBy(['userId' => $user->getId(), 'clientUuid' => $uuid]);

        return $this->json($note, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function deleteNoteByClientUuid(string $uuid, MarkdownNoteRepository $repo): JsonResponse
    {
        $didDelete = $repo->delete($uuid, $this->getUser());

        return new JsonResponse(null, ($didDelete ? 200 : 404));
    }

    public function upsertNote(MarkdownNoteRepository $repo, Request $request): JsonResponse
    {
        $hydrator = new NoteHydrator();
        $noteJsonString = $request->getContent();
        $note = $hydrator->getHydratedNote($noteJsonString);
        if ($note === null) {
            throw new Exception("Could not hydrate note with given JSON:\n{$noteJsonString}");
        }

        $noteEntity = $repo->upsert($note, $this->getUser());

        return $this->json($noteEntity, 200, [], [
            'groups' => ['main'],
        ]);
    }
}
