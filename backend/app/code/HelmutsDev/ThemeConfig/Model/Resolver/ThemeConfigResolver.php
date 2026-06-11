<?php
declare(strict_types=1);

namespace HelmutsDev\ThemeConfig\Model\Resolver;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

class ThemeConfigResolver implements ResolverInterface
{
    private ScopeConfigInterface $scopeConfig;

    public function __construct(ScopeConfigInterface $scopeConfig)
    {
        $this->scopeConfig = $scopeConfig;
    }

    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    ): array {
        return [
            'active_theme' => $this->scopeConfig->getValue(
                'helmutsdev_theme/general/active_theme',
                'default'
            ) ?? 'dark',
        ];
    }
}