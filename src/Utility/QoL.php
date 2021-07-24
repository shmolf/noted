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
    static public function arrPush(array $arr, $val): array
    {
        $arr[] = $val;
        return $arr;
    }
}
