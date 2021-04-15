<?php

namespace App\Controller\Users;

use App\Controller\BaseController;
use App\Entity\ProductCategory;
use App\Entity\UserAccount;
use Exception;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class AdminController extends BaseController
{
    public function __invoke(): Response
    {
        // $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $users = $this->getDoctrine()
            ->getRepository(UserAccount::class)
            ->findAll();

        return $this->render('account/admin.html.twig', [
            'users' => $users,
        ]);
    }

    public function updateTest(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $requestData = json_decode($request->getContent(), true);
        $email = $requestData['email'];
        $firstName = $requestData['first-name'];
        $lastName = $requestData['last-name'];
        $roles = $requestData['roles'];

        /** @var UserAccount */
        $user = $this->getDoctrine()
                ->getRepository(UserAccount::class)
                ->findOneBy([ 'email' => $email ]);

        $user->firstName = $firstName;
        $user->lastName = $lastName;
        $user->setRoles($roles);
        return $this->json($user, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $requestData = json_decode($request->getContent(), true);
        $email = self::trimMb4String($requestData['email'] ?? '');
        $firstName = isset($requestData['first-name']) ? self::trimMb4String($requestData['first-name']) : null;
        $lastName = isset($requestData['last-name']) ? self::trimMb4String($requestData['last-name']) : null;
        $roles = $requestData['roles'] ?? [];
        // return $this->json([
        //     $email,
        //     mb_strlen($email),
        //     preg_match('/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i', $email),
        //     mb_strlen($email) === 0 || preg_match('/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i', $email) !== 1
        // ]);

        if (mb_strlen($email) === 0 || preg_match('/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i', $email) !== 1) {
            $data = [
                'type' => 'validation_error',
                'title' => 'There was a validation error',
                'errors' => ['Email is invalid'],
            ];

            return new JsonResponse($data, 400);
        }

        $entityManager = $this->getDoctrine()->getManager();

        /** @var UserAccount */
        $user = $this->getDoctrine()
            ->getRepository(UserAccount::class)
            ->findOneBy([ 'email' => $email ]);

        if ($user === null) {
            $data = [
                'type' => 'not_found',
                'title' => 'Could not find the user',
                'errors' => ['User not found'],
            ];

            return new JsonResponse($data, 400);
        }

        $user->firstName = $firstName;
        $user->lastName = $lastName;

        $roles = array_map(function (string $role) {
            return self::trimMb4String($role);
        }, $roles);

        $roles = array_unique($roles);

        $roles = array_filter($roles, function (string $role) {
            return $role !== 'ROLE_USER';
        });

        $user->setRoles([]);

        foreach ($roles as $role) {
            if (mb_strlen($role) > 0) {
                $user->addRole($role);
            }
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            $data = [
                'type' => 'save_error',
                'title' => "There was a problem saving the user: {$email}",
                'errors' => $e->getMessage(),
            ];

            return new JsonResponse($data, 400);
        }

        return $this->json(
            $this->getDoctrine()->getRepository(UserAccount::class)->findOneBy([ 'email' => $email ]),
            200,
            [],
            ['groups' => ['main']]
        );
    }
}
