<?php

namespace App\Exception;

use Error;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class EntitySaveException extends Error
{
    public function __construct(string $className, Throwable $originalException)
    {
        parent::__construct();
        $this->message = "Error occurred when creating Entity: `{$className}`\n{$originalException->getMessage()}";
        $this->line = $originalException->getLine();
        $this->code = Response::HTTP_INTERNAL_SERVER_ERROR;
    }
}
