## Flow Diagram

<section class="flow-diagram">
  <ol>
    <li class="flow-diagram__section">
      <h3>Authorize</h3>
      <p>First, we have to make sure you’re fully authorized to create a new transfer. You do this by sending two authentication headers with the authorize request.</p>
      <ul>
        <li class="flow-diagram__item">
          <a href="#send-request">
            <h4>1.1 - Send authorization request</h4>
            <code><em>POST</em> /authorize</code>
          </a>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>Create a Transfer Object</h3>
      <p>Next up, we create an empty transfer object and tell it what items to expect in the next step. This is also where we retrieve the URL for the transfer itself.</p>
      <ul>
        <li class="flow-diagram__item">
          <a href="#create-object">
            <h4>2.1 - Create an empty transfer object</h4>
            <code><em>POST</em> /transfers</code>
          </a>
        </li>
        <li class="flow-diagram__item">
          <a href="#send-items">
            <h4>2.2 - Send list of items to transfer object</h4>
            <code><em>POST</em> /transfers/{transfer_id}/items</code>
          </a>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>Upload each file to Transfer Object</h3>
      <p>Then for each file part you request an upload URL that will show you where on Amazon to put it. Repeat until you’ve uploaded all parts and move on to next file.</p>
      <fieldset>
        <legend>for each part</legend>
        <ul>
          <li class="flow-diagram__item">
            <a href="#request-upload-url">
              <h4>3.1 - Request upload URL for part</h4>
              <code><em>GET</em> /files/{file_id}/uploads/{part_number}/{multipart_upload_id}</code>
            </a>
          </li>
          <li class="flow-diagram__item">
            <a href="#upload-part">
              <h4>3.2 - Upload part</h4>
              <code><em>PUT</em> {signed_s3_url}</code>
            </a>
          </li>
        </ul>
      </fieldset>
      <ul>
        <li class="flow-diagram__item">
          <a href="#complete-upload" class="call">
            <h4>3.3 - Complete file upload</h4>
            <code><em>POST</em> /files/{file_id}/uploads/complete</code>
          </a>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>Transfer completed</h3>
    </li>
  </ol>
</section>