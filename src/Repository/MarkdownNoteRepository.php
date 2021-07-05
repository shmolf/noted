<?php

namespace App\Repository;

use App\Entity\MarkdownNote;
use App\Entity\NoteTag;
use App\Entity\UserAccount;
use App\Exception\EntitySaveException;
use DateTime;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Exception;
use Ramsey\Uuid\Uuid;
use shmolf\NotedHydrator\Entity\NoteEntity as HydratedNote;
use Symfony\Component\HttpFoundation\Response;

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

    public function new(UserAccount $user): MarkdownNote
    {
        $entityManager = $this->getEntityManager();
        $noteEntity = new MarkdownNote();

        $noteEntity->setUser($user);
        $noteEntity->setInTrashcan(false);
        $noteEntity->setIsDeleted(false);
        $noteEntity->setUuid(Uuid::uuid4()->toString());

        $now = new DateTime();
        $noteEntity->setLastModified($now);
        $noteEntity->setCreatedDate($now);

        try {
            $entityManager->persist($noteEntity);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            throw new EntitySaveException(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $noteEntity;
    }

    public function upsert(string $uuid, HydratedNote $noteData, UserAccount $user): MarkdownNote
    {
        $entityManager = $this->getEntityManager();
        $noteEntity = $this->findOneBy(['user' => $user, 'uuid' => $uuid]);

        if ($noteEntity === null) {
            throw new EntitySaveException(Response::HTTP_NOT_FOUND, var_export([
                $uuid
            ], true));
        }

        $noteEntity
            ->setTitle($noteData->title)
            ->setContent($noteData->content)
            ->setInTrashcan($noteData->inTrashcan)
            ->setIsDeleted($noteData->isDeleted)
            ->clearTags()
            ->setLastModified(new DateTime());

        foreach ($noteData->tags as $tag) {
            $noteTag = $this->noteTagRepo->findOneBy(['user' => $user, 'name' => $tag]);

            if ($noteTag === null) {
                $noteTag = new NoteTag();
                $noteTag->setUser($user);
            }

            $noteTag->addMarkdownNote($noteEntity);

            if ($noteTag->getName() === null) {
                $noteTag->setName($tag);
            }

            try {
                $entityManager->persist($noteTag);
            } catch (Exception $e) {
                throw new EntitySaveException(500, null, $e);
            }

            $noteEntity->addTag($noteTag);
        }

        try {
            $entityManager->persist($noteEntity);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            throw new EntitySaveException(500, null, $e);
        }

        return $noteEntity;
    }

    public function delete(string $uuid, UserAccount $user): bool
    {
        $entityManager = $this->getEntityManager();
        $noteEntity = $this->findOneBy(['user' => $user, 'uuid' => $uuid]);

        if ($noteEntity === null) {
            return false;
        }

        $entityManager->remove($noteEntity);
        $entityManager->flush();

        return true;
    }
}
