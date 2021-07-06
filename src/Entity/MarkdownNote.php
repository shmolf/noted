<?php

namespace App\Entity;

use App\Repository\MarkdownNoteRepository;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=MarkdownNoteRepository::class)
 * @UniqueEntity(
 *      fields={"user","uuid"},
 *      message="Each user will have a their own set of unique uuids."
 * )
 */
class MarkdownNote
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @var int
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=16777215, nullable=true)
     * @Groups("main")
     */
    private ?string $content = null;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups("main")
     */
    private ?string $title = null;

    /**
     * @ORM\ManyToOne(targetEntity=UserAccount::class, inversedBy="markdownNotes")
     * @ORM\JoinColumn(nullable=false)
     */
    private UserAccount $user;

    /**
     * @ORM\Column(type="datetime")
     * @Groups("main")
     */
    private DateTimeInterface $createdDate;

    /**
     * @ORM\Column(type="datetime")
     * @Groups("main")
     */
    private DateTimeInterface $lastModified;

    /**
     * @ORM\ManyToMany(targetEntity=NoteTag::class, inversedBy="markdownNotes")
     * @Groups("main")
     * @var Collection<NoteTag>
     */
    private $tags;

    /**
     * @ORM\Column(type="boolean", options={"default" : false})
     * @Groups("main")
     */
    private bool $inTrashcan = false;

    /**
     * @ORM\Column(type="guid", unique=true)
     * @Groups("main")
     */
    private string $uuid;

    /**
     * @ORM\Column(type="boolean", options={"default" : false})
     */
    private bool $isDeleted = false;

    public function __construct()
    {
        $this->tags = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getUser(): ?UserAccount
    {
        return $this->user;
    }

    public function setUser(?UserAccount $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getCreatedDate(): ?DateTimeInterface
    {
        return $this->createdDate;
    }

    public function setCreatedDate(DateTimeInterface $createdDate): self
    {
        $this->createdDate = $createdDate;

        return $this;
    }

    public function getLastModified(): ?DateTimeInterface
    {
        return $this->lastModified;
    }

    public function setLastModified(DateTimeInterface $lastModified): self
    {
        $this->lastModified = $lastModified;

        return $this;
    }

    /**
     * @return Collection|NoteTag[]
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(NoteTag $tag): self
    {
        if (!$this->tags->contains($tag)) {
            $this->tags[] = $tag;
        }

        return $this;
    }

    public function removeTag(NoteTag $tag): self
    {
        $this->tags->removeElement($tag);

        return $this;
    }

    public function clearTags(): self
    {
        foreach ($this->tags as $tag) {
            $this->removeTag($tag);
        }

        return $this;
    }

    public function getInTrashcan(): ?bool
    {
        return $this->inTrashcan;
    }

    public function setInTrashcan(bool $inTrashcan): self
    {
        $this->inTrashcan = $inTrashcan;

        return $this;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function setUuid(string $uuid): self
    {
        $this->uuid = $uuid;

        return $this;
    }

    public function getIsDeleted(): ?bool
    {
        return $this->isDeleted;
    }

    public function setIsDeleted(bool $isDeleted): self
    {
        $this->isDeleted = $isDeleted;

        return $this;
    }
}
