<?php

namespace App\Entity;

use App\Repository\UserAccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=UserAccountRepository::class)
 */
class UserAccount implements UserInterface
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private ?int $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     * @Groups("main")
     */
    public ?string $email;

    /**
     * @ORM\Column(type="json")
     * @Groups("main")
     * @var string[]
     */
    private $roles = [];

    /**
     * @ORM\Column(type="string", length=180)
     * @var string|null The hashed password
     */
    private ?string $password;

    /**
     * @ORM\Column(type="datetime")
     * @Groups("main")
     */
    public ?\DateTime $createdDate = null;

    /**
     * @ORM\Column(type="string", length=190, nullable=true)
     */
    public ?string $apiToken;

    /**
     * @ORM\Column(type="string", length=190, nullable=true)
     * @Groups("main")
     */
    public ?string $firstName;

    /**
     * @ORM\Column(type="string", length=190, nullable=true)
     * @Groups("main")
     */
    public ?string $lastName;

    /**
     * @ORM\OneToMany(targetEntity=MarkdownNote::class, mappedBy="user", orphanRemoval=true)
     */
    private $markdownNotes;

    /**
     * @ORM\OneToMany(targetEntity=NoteTag::class, mappedBy="user", orphanRemoval=true)
     */
    private $noteTags;

    public function __construct()
    {
        $this->markdownNotes = new ArrayCollection();
        $this->noteTags = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function addRole(string $role): self
    {
        if (!in_array($role, $this->roles)) {
            $this->roles[] = $role;
        }

        return $this;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): ?string
    {
        return (string) $this->password;
    }

    public function setPassword(?string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'userName' => $this->getUsername(),
            'email' => $this->email,
            'createdDate' => $this->createdDate,
        ];
    }

    /**
     * @return Collection|MarkdownNote[]
     */
    public function getMarkdownNotes(): Collection
    {
        return $this->markdownNotes;
    }

    public function addMarkdownNote(MarkdownNote $markdownNote): self
    {
        if (!$this->markdownNotes->contains($markdownNote)) {
            $this->markdownNotes[] = $markdownNote;
            $markdownNote->setUser($this);
        }

        return $this;
    }

    public function removeMarkdownNote(MarkdownNote $markdownNote): self
    {
        if ($this->markdownNotes->removeElement($markdownNote)) {
            // set the owning side to null (unless already changed)
            if ($markdownNote->getUser() === $this) {
                $markdownNote->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection|NoteTag[]
     */
    public function getNoteTags(): Collection
    {
        return $this->noteTags;
    }

    public function addNoteTag(NoteTag $noteTag): self
    {
        if (!$this->noteTags->contains($noteTag)) {
            $this->noteTags[] = $noteTag;
            $noteTag->setUser($this);
        }

        return $this;
    }

    public function removeNoteTag(NoteTag $noteTag): self
    {
        if ($this->noteTags->removeElement($noteTag)) {
            // set the owning side to null (unless already changed)
            if ($noteTag->getUser() === $this) {
                $noteTag->setUser(null);
            }
        }

        return $this;
    }
}
