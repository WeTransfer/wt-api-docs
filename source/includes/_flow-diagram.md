## Flow Diagram

<section class="flow-diagram">
  <ul>
    <li class="flow-diagram__section">
      <h3>1 - Authorize</h3>
      <p>First, we have to make sure you’re fully authorized to create a new transfer. You do this by sending two authentication headers with the authorize request.</p>
      <ul>
        <li class="flow-diagram__item">
          <h4>1.1 - Send authorization request</h4>
          <code><em>POST</em> /authorize</code>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>2 - Create a Transfer Object</h3>
      <p>Next up, we create an empty transfer object and tell it what items to expect in the next step.</p>
      <ul>
        <li class="flow-diagram__item">
          <h4>2.1 - Create an empty transfer object</h4>
          <code><em>POST</em> /transfers</code>
        </li>
        <li class="flow-diagram__item">
          <h4>2.2 - Send list of items to transfer object</h4>
          <code><em>POST</em> /transfers/{transfer_id}/items</code>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>3 - Upload each file to Transfer Object</h3>
      <p>Then for each file part you request an upload URL that will show you where on Amazon to put it. Repeat until you’ve uploaded all parts and move on to next file.</p>
      <fieldset>
        <legend>for each part</legend>
        <ul>
          <li class="flow-diagram__item">
            <h4>3.1 - Request upload URL for part</h4>
            <code><em>GET</em> /files/{file_id}/uploads/{part_number}/{multipart_upload_id}</code>
          </li>
          <li class="flow-diagram__item">
            <h4>3.2 - Upload part</h4>
            <code><em>PUT</em> {aws_slot}</code>
          </li>
        </ul>
      </fieldset>
      <ul>
        <li class="flow-diagram__item">
          <h4>3.3 - Complete file upload</h4>
          <code><em>POST</em> /files/{file_id}/uploads/complete</code>
        </li>
      </ul>
    </li>
  </ul>
</section>