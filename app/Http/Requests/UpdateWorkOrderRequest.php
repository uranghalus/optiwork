<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'           => ['sometimes', 'required', 'string', 'max:255'],
            'job_description' => ['sometimes', 'required', 'string'],
            'priority'        => ['sometimes', 'required', 'in:normal,urgent_request_by_owner,urgent_by_accident'],
            'department_id'   => ['sometimes', 'required', 'integer', 'exists:departments,id'],
            'tenant_id'       => ['nullable', 'integer', 'exists:tenants,id'],
            'attachment'      => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:10240'],
        ];
    }
}
