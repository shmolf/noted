<?php

namespace App\Controller\Notes;

use App\Entity\MarkdownNote;
use App\Entity\NoteTag;
use App\Entity\UserAccount;
use App\Repository\MarkdownNoteRepository;
use DateTime;
use Exception;
use shmolf\NotedHydrator\NoteHydrator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class NotesController extends AbstractController
{
    public function getNoteList(): JsonResponse
    {
        /** @var UserAccount */
        $user = $this->getUser();
        $notes = $this->getDoctrine()
            ->getRepository(MarkdownNote::class)
            ->findBy(['user' => $user], ['lastModified' => 'DESC']);

        $noteList = array_map(function (MarkdownNote $note) {
            return [
                'title' => $note->getTitle(),
                'tags' => array_map(function (NoteTag $tag) {
                        return $tag->getName();
                }, $note->getTags()->toArray()),
                'inTrashcan' => $note->getInTrashcan(),
                'createdDate' => $note->getCreatedDate(),
                'lastModified' => $note->getLastModified(),
                'uuid' => $note->getUuid(),
            ];
        }, $notes);

        return new JsonResponse($noteList);
    }

    public function getNotesForUser(): JsonResponse
    {
        /** @var UserAccount */
        $user = $this->getUser();
        $notes = $this->getDoctrine()
            ->getRepository(MarkdownNote::class)
            ->findBy(['user' => $user]);

        $jsonResponse = $this->json($notes, 200, [], [
            'groups' => ['main'],
        ]);

        $now = (new DateTime())->format('Y-m-d-His');
        $disposition = $jsonResponse->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            "note'd-export-{$now}.json"
        );

        $jsonResponse->headers->set('Content-Disposition', $disposition);

        return $jsonResponse;
    }

    public function newNote(MarkdownNoteRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof UserAccount) {
            throw new Exception('User is not logged in');
        }

        $noteEntity = $repo->newNote($user);

        return $this->json($noteEntity, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function getNoteByUuid(string $uuid): JsonResponse
    {
        /** @var UserAccount */
        $user = $this->getUser();
        $note = $this->getDoctrine()
            ->getRepository(MarkdownNote::class)
            ->findOneBy(['user' => $user, 'uuid' => $uuid]);

        if ($note === null) {
            return new JsonResponse(null, Response::HTTP_NOT_FOUND);
        }

        return $this->json($note, 200, [], [
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
