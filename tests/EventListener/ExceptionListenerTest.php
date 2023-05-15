<?php

namespace App\Tests\EventListener;

use App\EventListener\ExceptionListener;
use App\Exception\EntitySaveException;
use Exception;
use PHPUnit\Framework\TestCase;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Throwable;

class ExceptionListenerTest extends TestCase
{
    /** @var EventDispatcher **/
    private $dispatcher;

    protected function setUp(): void
    {
        $this->dispatcher = new EventDispatcher();
    }

    public function testXhrRequestsReturnJsonErrorPackage(): void
    {
        $listener = new ExceptionListener();
        $this->dispatcher->addListener('onKernelException', [$listener, 'onKernelException']);

        // $client = static::createClient();
        // $client->xmlHttpRequest('POST', '/submit', ['name' => 'Fabien']);
        // $client->request(
        //     'GET',
        //     '/demo/hello/Fabien',
        //     array(),
        //     array(),
        //     array(
        //         'CONTENT_TYPE'          => 'application/json',
        //         'HTTP_REFERER'          => '/foo/bar',
        //         'HTTP_X-Requested-With' => 'XMLHttpRequest',
        //     )
        // );

        $request = new Request([], [], [], [], [], ['HTTP_X-Requested-With' => 'XMLHttpRequest']);

        // $request = $this->createMock(Request::class);
        // $request->headers->set('X-Requested-With', 'XMLHttpRequest');

        $event = new ExceptionEvent(
            $this->createMock(HttpKernelInterface::class),
            $request,
            HttpKernelInterface::MAIN_REQUEST,
            new EntitySaveException(Response::HTTP_BAD_REQUEST)
        );

        $this->dispatcher->dispatch($event, 'onKernelException');

        $jsonData = [
            'type' => 'Exception',
            'title' => "There was a problem with your request.",
            'errors' => $event->getThrowable()->getMessage(),
        ];

        // Assert
        self::assertInstanceOf(JsonResponse::class, $event->getResponse());
        self::assertIsString($event->getResponse()->getContent());
        self::assertJsonStringEqualsJsonString(json_encode($jsonData), $event->getResponse()->getContent());
        // self::assertStringContainsString('message', $event->getResponse()->getContent());
        // self::assertStringContainsString('code', $event->getResponse()->getContent());
    }

    public function testHtmlRequestsWithEntitySaveExceptionReturnsRelativeStatusCode(): void
    {
        $listener = new ExceptionListener();
        $this->dispatcher->addListener('onKernelException', [$listener, 'onKernelException']);

        $event = new ExceptionEvent(
            $this->createMock(HttpKernelInterface::class),
            $this->createMock(Request::class),
            HttpKernelInterface::MAIN_REQUEST,
            new EntitySaveException(Response::HTTP_BAD_REQUEST)
        );

        $this->dispatcher->dispatch($event, 'onKernelException');

        // Assert
        self::assertInstanceOf(Response::class, $event->getResponse());
        self::assertIsString($event->getResponse()->getContent());
        self::assertEquals(Response::HTTP_BAD_REQUEST, $event->getResponse()->getStatusCode());
    }

    public function testHtmlRequestsWithArbitraryExceptionReturns500StatusCode(): void
    {
        $listener = new ExceptionListener();
        $this->dispatcher->addListener('onKernelException', [$listener, 'onKernelException']);

        $event = new ExceptionEvent(
            $this->createMock(HttpKernelInterface::class),
            $this->createMock(Request::class),
            HttpKernelInterface::MAIN_REQUEST,
            new Exception(Response::HTTP_NOT_FOUND)
        );

        $this->dispatcher->dispatch($event, 'onKernelException');

        // Assert
        self::assertInstanceOf(Response::class, $event->getResponse());
        self::assertIsString($event->getResponse()->getContent());
        self::assertEquals(Response::HTTP_INTERNAL_SERVER_ERROR, $event->getResponse()->getStatusCode());
    }
}
