<?php
namespace IainBallantyne\ShowStock\Plugin\Block\ConfigurableProduct\Product\View\Type;

use Magento\Framework\Json\EncoderInterface;
use Magento\Framework\Json\DecoderInterface;

class Configurable
{
    /**
     * @var EncoderInterface
     */
    protected $jsonEncoder;

    /**
     * @var DecoderInterface
     */
    protected $jsonDecoder;

    /**
     * @var \Magento\CatalogInventory\Api\StockRegistryInterface
     */
    protected $stockRegistry;

    /**
     * Configurable constructor.
     *
     * @param EncoderInterface $jsonEncoder
     * @param DecoderInterface $jsonDecoder
     * @param \Magento\CatalogInventory\Api\StockRegistryInterface $stockRegistry
     */
    public function __construct(
        EncoderInterface $jsonEncoder,
        DecoderInterface $jsonDecoder,
        \Magento\CatalogInventory\Api\StockRegistryInterface $stockRegistry
    ) {
        $this->jsonDecoder = $jsonDecoder;
        $this->jsonEncoder = $jsonEncoder;
        $this->stockRegistry = $stockRegistry;
    }

    /**
     * @param \Magento\ConfigurableProduct\Block\Product\View\Type\Configurable $subject
     * @param \Closure $proceed
     * @return string
     */
    public function aroundGetJsonConfig(
        \Magento\ConfigurableProduct\Block\Product\View\Type\Configurable $subject,
        \Closure $proceed
    ) {
        $config = $proceed();
        $config = $this->jsonDecoder->decode($config);
        $productsCollection = $subject->getAllowProducts();

        $stockConfig = [];
        $attributeCodes = [];

        foreach($config['attributes'] as $id => $attribute) {
            $attributeCodes[] = $attribute['code'];
        }

        foreach ($productsCollection as $product) {
            $productId = $product->getId();
            $stockItem = $this->stockRegistry->getStockItem($product->getId());

            $key = '';
            for($x = 0; $x < count($attributeCodes); $x++) {
                if($x > 0) {
                    $key .= '-';
                }
               $key .= $product->getData($attributeCodes[$x]);
            }

            $stockConfig[$key] = $stockItem->getQty();
        }

        $stockConfig['in_stock_label'] = __('In Stock');

        $config['stockConfig'] = $stockConfig;
        return $this->jsonEncoder->encode($config);
    }
}