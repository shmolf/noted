<?php

namespace App\Utility;

class QoL
{
    /**
     * @template T
     *
     * @param array<array-key, T> $arr
     * @param T $val
     * @return array<array-key, T>
     */
    public static function arrPush(array $arr, $val): array
    {
        $arr[] = $val;
        return $arr;
    }
}
