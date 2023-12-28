<?php

namespace App\EventListener;

use App\Exception\EntitySaveException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $response = $event->getRequest()->isXmlHttpRequest()
            ? $this->buildJsonResponse($event->getThrowable())
            : $this->buildPageResponse($event->getThrowable());

        $event->setResponse($response);
    }

    private function buildJsonResponse(Throwable $exception): JsonResponse
    {
        $data = [
            'type' => 'Exception',
            'title' => "There was a problem with your request.",
            'errors' => $exception->getMessage(),
        ];

        $statusCode = $exception->getCode() > 0 ? $exception->getCode() : Response::HTTP_INTERNAL_SERVER_ERROR;

        return new JsonResponse($data, $statusCode);
    }

    private function buildPageResponse(Throwable $exception): Response
    {
        $response = new Response();
        $response->setContent($exception->getMessage());

        if ($exception instanceof HttpExceptionInterface || $exception instanceof EntitySaveException) {
            $response->setStatusCode($exception->getStatusCode());
            $response->headers->replace($exception->getHeaders());
        } else {
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $response;
    }
}
