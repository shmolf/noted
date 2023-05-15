<?php

namespace App\Exception;

use Exception;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class EntitySaveException extends HttpException implements Throwable
{
    public function __construct(
        int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR,
        string $message = '',
        Exception $previous = null,
        array $headers = [],
        ?int $code = 0
    ) {
        parent::__construct($statusCode, $message, $previous, $headers, $code);
    }
}
