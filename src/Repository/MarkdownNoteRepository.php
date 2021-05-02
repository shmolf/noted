<?php

namespace App\Repository;

use App\Entity\MarkdownNote;
use App\Entity\NoteTag;
use App\Exception\EntitySaveException;
use DateTime;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Exception;
use Ramsey\Uuid\Uuid;
use shmolf\NotedRequestHandler\Entity\NoteEntity as ClientNoteEntity;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @method MarkdownNote|null find($id, $lockMode = null, $lockVersion = null)
 * @method MarkdownNote|null findOneBy(array $criteria, array $orderBy = null)
 * @method MarkdownNote[]    findAll()
 * @method MarkdownNote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MarkdownNoteRepository extends ServiceEntityRepository
{
    private NoteTagRepository $noteTagRepo;

    public function __construct(ManagerRegistry $registry, NoteTagRepository $noteTagRepo)
    {
        parent::__construct($registry, MarkdownNote::class);
        $this->noteTagRepo = $noteTagRepo;
    }

    // /**
    //  * @return MarkdownNote[] Returns an array of MarkdownNote objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('m.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?MarkdownNote
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */

    public function upsert(ClientNoteEntity $noteData, UserInterface $user): MarkdownNote
    {
        $entityManager = $this->getEntityManager();
        $userId = $user->getUsername();

        // First, try to fetch by the Host UUID, then the Client Uuid, and finally just create a new one
        $noteEntity = $this->findOneBy(['userId' => $userId, 'noteUuid' => $noteData->noteUuid])
            ?? $this->findOneBy(['userId' => $userId, 'clientUuid' => $noteData->clientUuid])
            ?? new MarkdownNote();

        $noteEntity->setUserId($user);
        $noteEntity->setTitle($noteData->title);
        $noteEntity->setContent($noteData->content);
        $noteEntity->setInTrashcan($noteData->inTrashcan);
        $noteEntity->setIsDeleted($noteData->isDeleted);

        if ($noteEntity->getNoteUuid() === null) {
            $noteEntity->setNoteUuid(Uuid::uuid4()->toString());
        }

        $noteEntity->setClientUuid($noteData->clientUuid ?? $noteEntity->getNoteUuid());

        $now = new DateTime();
        $noteEntity->setLastModified($now);

        if ($noteEntity->getCreatedDate() === null) {
            $noteEntity->setCreatedDate($now);
        }

        $noteEntity->clearTags();

        foreach ($noteData->tags as $tag) {
            $noteTag = $this->noteTagRepo
                ->findOneBy(['userId' => $userId, 'name' => $tag])
                ?? new NoteTag();
            $noteTag->addMarkdownNote($noteEntity);
            $noteTag->setUserId($user);

            if ($noteTag->getName() === null) {
                $noteTag->setName($tag);
            }

            try {
                $entityManager->persist($noteTag);
            } catch (Exception $e) {
                throw new EntitySaveException(NoteTag::class, $e);
            }

            $noteEntity->addTag($noteTag);
        }

        try {
            $entityManager->persist($noteEntity);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            throw new EntitySaveException(MarkdownNote::class, $e);
        }

        return $noteEntity;
    }

    public function delete(string $clientUuid, UserInterface $user): bool
    {
        $entityManager = $this->getEntityManager();
        $userId = $user->getUsername();

        // First, try to fetch by the Host UUID, then the Client Uuid, and finally just create a new one
        $noteEntity = $this->findOneBy(['userId' => $userId, 'clientUuid' => $clientUuid]);

        if ($noteEntity === null) {
            return false;
        }

        $entityManager->remove($noteEntity);
        $entityManager->flush();

        return true;
    }
}
