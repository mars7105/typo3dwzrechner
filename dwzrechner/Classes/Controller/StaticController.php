<?php
class Tx_DWZRechner_Controller_StaticController extends Tx_Extbase_MVC_Controller_ActionController {
	public function dwzrechnerAction() {
		$this -> response -> addAdditionalHeaderData ('
<script type="text/javascript" src="' . t3lib_extMgm::siteRelPath($this -> request -> getControllerExtensionKey()) . 'Resources/Public/Scripts/dwzrechner.js"></script>
');
		$this -> response -> addAdditionalHeaderData ('
<link href="' . t3lib_extMgm::siteRelPath($this -> request -> getControllerExtensionKey()) . 'Resources/Public/css/dwzstyle.css" type="text/css" rel="stylesheet" />
');
		$this -> view -> assign('formaction', 'index.html');
	}

}
?>
