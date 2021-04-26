<?php

namespace App\EventListener;

use App\Exception\EntitySaveException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ExceptionListener
{
    public function onKernelException(Request $request, ExceptionEvent $event): void
    {
        $response = $request->isXmlHttpRequest()
            ? $this->buildJsonRespons($event->getThrowable())
            : $this->buildPageResponse($event->getThrowable());

        $event->setResponse($response);
    }

    private function buildJsonRespons(Throwable $exception): JsonResponse
    {
        $data = [
            'type' => 'Exception',
            'title' => "There was a problem with your request.",
            'errors' => $exception->getMessage(),
        ];

        return new JsonResponse($data, $exception->getCode());

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
