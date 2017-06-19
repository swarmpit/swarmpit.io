<?php

	if($_POST) {

	    // Enter the email where you want to receive notification

		$emailTo = 'trnkapavel@gmail.com';

          // DON'T EDIT BELOW CODE

    	$subscriber_email = ($_POST['email']);

		    // Send email code
			$subject = 'Nový odběratel Swarmpit - Subscribe';
			$message = "Máte nový kontaktní e-mail na majitele!\n\nEmail: " . $subscriber_email;
			$headers = "From: ".$subscriber_email." <" . $subscriber_email . ">" . "\r\n" . "Odpověďět na e-mail odesílatele: " . $subscriber_email;

			mail($emailTo, $subject, $message, $headers);


		}
?>
