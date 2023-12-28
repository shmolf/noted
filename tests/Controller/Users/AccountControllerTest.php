<?php

namespace App\Tests\Controller\Users;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class AccountControllerTest extends WebTestCase
{
    /**
     * @group account-creation
     */
    public function testCreate()
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/account/create',
            [
                'email' => 'test@example.com',
                'first-name' => 'Test',
                'last-name' => 'User',
                'password' => 'C0mpl3xP@ssw0rd',
            ]
        );

        self::assertTrue($client->getResponse()->isRedirect('/login'));
    }

    /**
     * @group account-creation
     * @group bad
     */
    public function testCreateWithBadPassword()
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/account/create',
            [
                'email' => 'test@example.com',
                'first-name' => 'Test',
                'last-name' => 'User',
                'password' => 'complexpassword',
            ]
        );


        $jsonData = [
            'type' => 'validation_error',
            'title' => 'There was a validation error',
            'errors' => ['Password is invalid'],
        ];

        // Assert
        self::assertInstanceOf(JsonResponse::class, $client->getResponse());
        self::assertIsString($client->getResponse()->getContent());
        self::assertJsonStringEqualsJsonString(json_encode($jsonData), $client->getResponse()->getContent());
    }

    /**
     * @group account-creation
     * @group bad
     */
    public function testCreateWithBadEmail()
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/account/create',
            [
                'email' => 'test@example',
                'first-name' => 'Test',
                'last-name' => 'User',
                'password' => 'C0mpl3xP@ssw0rd',
            ]
        );


        $jsonData = [
            'type' => 'validation_error',
            'title' => 'There was a validation error',
            'errors' => ['Email is invalid'],
        ];

        // Assert
        self::assertInstanceOf(JsonResponse::class, $client->getResponse());
        self::assertIsString($client->getResponse()->getContent());
        self::assertJsonStringEqualsJsonString(json_encode($jsonData), $client->getResponse()->getContent());
    }

    /**
     * @group account-creation
     * @group bad
     */
    public function testCreateWithDuplicateUser()
    {
        $client = static::createClient();
        $createClientRequest = fn() => $client->request(
            'POST',
            '/account/create',
            [
                'email' => 'test@example.com',
                'first-name' => 'Test',
                'last-name' => 'User',
                'password' => 'C0mpl3xP@ssw0rd',
            ]
        );

        $createClientRequest();
        $createClientRequest();

        $jsonData = [
            'type' => 'validation_error',
            'title' => 'There was a validation error',
            'errors' => ['User already exists'],
        ];

        // Assert
        self::assertInstanceOf(JsonResponse::class, $client->getResponse());
        self::assertIsString($client->getResponse()->getContent());
        self::assertJsonStringEqualsJsonString(json_encode($jsonData), $client->getResponse()->getContent());
    }
}
