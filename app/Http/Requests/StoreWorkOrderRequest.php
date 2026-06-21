<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'           => ['required', 'string', 'max:255'],
            'job_description' => ['required', 'string'],
            'priority'        => ['required', 'in:normal,urgent_request_by_owner,urgent_by_accident'],
            'department_id'   => ['required', 'integer', 'exists:departments,id'],
            'tenant_id'       => ['nullable', 'integer', 'exists:tenants,id'],
            'attachment'      => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:10240'],
        ];
    }
}
