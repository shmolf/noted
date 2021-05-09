<?php

namespace App\Controller;

use App\Entity\UserAccount;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

abstract class BaseController extends AbstractController
{
    /* \p{Ll} - Lowercase Letter
     * \p{Lu} - Uppercase Letter
     * (\pP|\pS - \pP Punctuation, or \pS Symbol (which should include emojis)
     * \p{Nd} - Number
     */
    protected const REGEX_PASSWORD = "/^(?=.*\p{Ll}+)(?=.*\p{Lu}+)(?=.*(\pP|\pS)+)(?=.*\p{Nd}+).*$/u";

    protected const REGEX_EMAIL = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

    protected function getUser(): UserAccount
    {
        return parent::getUser();
    }

    protected static function trimMb4String(string $string, string $trim_chars = '\s'): string
    {
        return preg_replace("/^[{$trim_chars}]*(?U)(.*)[{$trim_chars}]*$/u", '\\1', $string);
        // return preg_replace('/^['.$trim_chars.']*(?U)(.*)['.$trim_chars.']*$/u', '\\1',$string);
    }
}
