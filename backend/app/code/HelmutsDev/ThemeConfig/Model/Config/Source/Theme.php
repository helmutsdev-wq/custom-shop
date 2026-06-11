<?php
declare(strict_types=1);

namespace HelmutsDev\ThemeConfig\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;

class Theme implements OptionSourceInterface
{
    public function toOptionArray(): array
    {
        return [
            ['value' => 'dark', 'label' => __('Obsidian Dark')],
            ['value' => 'light', 'label' => __('Obsidian Light')],
        ];
    }
}