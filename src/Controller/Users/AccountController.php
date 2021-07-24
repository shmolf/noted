<?php

namespace App\Controller\Users;

use App\Controller\BaseController;
use App\Entity\UserAccount;
use App\Entity\Workspace;
use App\Repository\WorkspaceRepository;
use App\Utility\QoL;
use DateTime;
use Exception;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * @method UserAccount|null getUser()
 */
class AccountController extends BaseController
{

    private RouterInterface $router;

    private UserPasswordEncoderInterface $passwordEncoder;

    public function __construct(
        RouterInterface $router,
        UserPasswordEncoderInterface $passwordEncoder
    ) {
        $this->router = $router;
        $this->passwordEncoder = $passwordEncoder;
    }

    public function index()
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $workSpaces = array_reduce(
            $this->getUser()->getWorkspaces()->toArray(),
            fn(array $workSpaces, Workspace $workSpace) => QoL::arrPush($workSpaces, [
                'name' => $workSpace->getName(),
                'expiration' => $workSpace->getTokenExpiration(),
                'origin' => $workSpace->getOrigin(),
                'creation' => $workSpace->getCreationDate(),
                'uuid' => $workSpace->getUuid(),
                'refreshUri' => $workSpace->getTokenUri(),
            ]),
            []
        );

        return $this->render('account/index.html.twig', [
            'user' => $this->getUser(),
            'workspaces' => $workSpaces,
        ]);
    }

    public function accountApi(): JsonResponse
    {
        $user = $this->getUser();
        return $this->json($user, 200, [], [
            'groups' => ['main'],
        ]);
    }

    public function form(): Response
    {
        return $this->render('security/create.html.twig', []);
    }

    public function create(Request $request): Response
    {
        $requestData = $request->request->all();
        $email = self::trimMb4String($requestData['email'] ?? '');
        $firstName = isset($requestData['first-name']) ? self::trimMb4String($requestData['first-name']) : null;
        $lastName = isset($requestData['last-name']) ? self::trimMb4String($requestData['last-name']) : null;
        $password = isset($requestData['password']) ? $requestData['password'] : null;
        $errors = [];

        if (mb_strlen($email) === 0 || preg_match(self::REGEX_EMAIL, $email) !== 1) {
            $errors[] = 'Email is invalid';
        }

        $user = $this->getDoctrine()->getRepository(UserAccount::class)->findOneBy([ 'email' => $email ]);

        if ($user !== null) {
            $errors[] = 'User already exists';
        } elseif (mb_strlen($password) === 0 || preg_match(self::REGEX_PASSWORD, $password) !== 1) {
            $errors[] = 'Password is invalid';
        }

        if (count($errors) > 0) {
            $data = [
                'type' => 'validation_error',
                'title' => 'There was a validation error',
                'errors' => $errors,
            ];

            return new JsonResponse($data, 400);
        }

        $entityManager = $this->getDoctrine()->getManager();
        $user = new UserAccount();

        $user->email = $email;
        $user->setPassword($this->passwordEncoder->encodePassword($user, $password));
        $user->firstName = $firstName;
        $user->lastName = $lastName;
        $user->createdDate = new DateTime();

        try {
            $entityManager->persist($user);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            $thisUser = $this->getUser();
            $errors = $thisUser !== null && in_array('ROLE_ADMIN', $thisUser->getRoles())
                ? $e->getMessage()
                : "There was a problem saving the user: {$email}";
            $data = [
                'type' => 'save_error',
                'title' => "There was a problem saving the user: {$email}",
                'errors' => [$errors],
            ];

            return new JsonResponse($data, 400);
        }

        return $this->redirectToRoute('login');
    }

    public function edit(Request $request): Response
    {
        $requestData = $request->request->all();
        $email = self::trimMb4String($requestData['email'] ?? '');
        $password = isset($requestData['password']) ? $requestData['password'] : null;
        $firstName = isset($requestData['first-name']) ? self::trimMb4String($requestData['first-name']) : null;
        $lastName = isset($requestData['last-name']) ? self::trimMb4String($requestData['last-name']) : null;
        $errors = [];

        if (mb_strlen($email) === 0 || preg_match(self::REGEX_EMAIL, $email) !== 1) {
            $errors[] = 'Email is invalid';
        } elseif (mb_strlen($password) === 0 || preg_match(self::REGEX_PASSWORD, $password) !== 1) {
            $errors[] = 'Password is invalid';
        }

        /** @var UserAccount|null */
        $user = $this->getDoctrine()->getRepository(UserAccount::class)->findOneBy([ 'email' => $email ]);
        $authenticatedUser = $this->getUser();

        if ($authenticatedUser === null) {
            $errors[] = 'User is not logged in';
        } elseif ($user !== null && $user->email !== $authenticatedUser->email) {
            $errors[] = 'User already exists';
        }

        if (count($errors) > 0) {
            $data = [
                'type' => 'validation_error',
                'title' => 'There was a validation error',
                'errors' => $errors,
                $user->email,
                $authenticatedUser->email,
                $user !== null && $user->email !== $authenticatedUser->email,
            ];

            return new JsonResponse($data, 400);
        }

        $entityManager = $this->getDoctrine()->getManager();

        $authenticatedUser->email = $email;
        $authenticatedUser->setPassword($this->passwordEncoder->encodePassword($authenticatedUser, $password));
        $authenticatedUser->firstName = $firstName;
        $authenticatedUser->lastName = $lastName;

        try {
            $entityManager->persist($authenticatedUser);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            $errors = $authenticatedUser !== null && in_array('ROLE_ADMIN', $authenticatedUser->getRoles())
                ? $e->getMessage()
                : "There was a problem saving the user: {$email}";
            $data = [
                'type' => 'save_error',
                'title' => "There was a problem saving the user: {$email}",
                'errors' => [$errors],
            ];

            return new JsonResponse($data, 400);
        }

        return $this->redirectToRoute('login');
        return new RedirectResponse($this->router->generate('login'));
    }

    public function workspaceRegistration(Request $request, LoggerInterface $logger): Response
    {
        $entityManager = $this->getDoctrine()->getManager();
        $workspace = new Workspace();

        $workspace->setCreationDate(new DateTime());
        $workspace->setName($request->request->get('workspaceName', 'No Name Provided'));
        $workspace->setToken($request->request->get('refreshToken', ''));
        $workspace->setTokenExpiration(new DateTime($request->request->get('refreshExpiration', 'now')));
        $workspace->setOrigin($request->request->get('workspaceOrigin', ''));
        $workspace->setTokenUri($request->request->get('refreshUri', ''));
        $workspace->setUuid(Uuid::uuid4()->toString());
        $this->getUser()->addWorkspace($workspace);

        try {
            $entityManager->persist($workspace);
            $entityManager->flush();
            $entityManager->clear();
        } catch (Exception $e) {
            $logger->error($e->getMessage(), $e->getTrace());
        }

        return new JsonResponse(['state' => 'success']);
    }

    public function workspaceDelete(string $uuid, WorkspaceRepository $repository): Response
    {
        $didDelete = $repository->delete($uuid, $this->getUser());
        return new JsonResponse(null, ($didDelete ? 200 : 404));
    }
}
