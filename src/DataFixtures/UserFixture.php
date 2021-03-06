<?php

namespace App\DataFixtures;

use App\Entity\UserAccount;
use DateTime;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixture extends BaseFixture
{
    private UserPasswordHasherInterface $passwordEncoder;

    public function __construct(UserPasswordHasherInterface $passwordEncoder)
    {
        $this->passwordEncoder = $passwordEncoder;
    }
    public function loadData(ObjectManager $manager)
    {
        $this->createMany(10, 'main_users', function (int $i) {
            $user = new UserAccount();
            $user->email = sprintf('fake%d@null.com', $i);
            $user->setPassword($this->passwordEncoder->hashPassword($user, 'pickle rick'));
            $user->firstName = $this->faker->firstName;
            $user->lastName = $this->faker->lastName;
            $user->createdDate = new DateTime();
            return $user;
        });

        $this->createMany(3, 'admin_users', function ($i) {
            $user = new UserAccount();
            $user->email = sprintf('admin%d@null.com', $i);
            $user->firstName = $this->faker->firstName;
            $user->setRoles(['ROLE_ADMIN']);
            $user->setPassword($this->passwordEncoder->hashPassword(
                $user,
                'pickle rick'
            ));
            $user->createdDate = new DateTime();
            return $user;
        });

        $manager->flush();
    }
}
