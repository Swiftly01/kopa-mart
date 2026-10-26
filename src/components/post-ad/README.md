# Post ad (frontend)

The "Post new ad" screens. The backend sends a **description of the form** for each category,
and this code draws it. So a new category (cars, phones, ...) shows up here with **no new form
code**.

Backend counterpart: `src/app/domain/listings/README.md` in the API project.

---

## 1. How it works

```
 /post-ad                      ChooseCategory      GET /listings/categories
     │ tap a category
     ▼
 /post-ad/:categoryId          PostAdForm          GET /listings/categories/:id/form
     │                          │
     │                          ├─ DynamicField (one per field in the description)
     │                          │     picks InputField / PickerField / PhotosField / ...
     │ press "Post ad"          │
     ▼                          ▼
 usePostAdSubmit:  POST /listings  ->  POST /listings/:id/images  ->  POST /listings/:id/publish
     │
     ▼
 /my-ads                       MyAds               GET /listings/mine
```

A field description looks like this (from the API):

```json
{ "key": "details.bedrooms", "label": "Bedrooms", "type": "select", "required": true,
  "searchable": true, "options": [ { "value": 2, "label": "2", "popular": true }, ... ] }
```

- `key` is where the value goes in the request body (`details.bedrooms` becomes `{ details: { bedrooms: 2 } }`).
- `type` decides which input is shown.
- `required`, `minLength`, `maxLength`, `min`, `max`, `minItems`... become form rules automatically.

---

## 2. Files and what each does

### Pages (`src/pages/post-ad/`)

| File | Purpose |
|---|---|
| `ChooseCategory.tsx` | Step 1. Lists the categories the backend accepts ads for, with loading and retry states. Tapping one goes to `/post-ad/:categoryId`. |
| `PostAdForm.tsx` | Step 2. Loads the form description, then renders it. Split in two components on purpose: `PostAdForm` handles loading/error; `PostAdFormBody` only mounts once the description exists, so React Hook Form starts with the right default values. Has the "Clear" button, the fixed category row, the contact block, the submit button, and scroll-to-first-error. |
| `MyAds.tsx` | The user's own ads with a status badge (Draft / Active / Paused), loading and empty states. |

### Field components (`src/components/post-ad/`)

| File | Purpose |
|---|---|
| `DynamicField.tsx` | The dispatcher: reads `field.type` and returns the right component. Unknown types are skipped (not a crash), so an older app survives a newer backend. |
| `FieldShell.tsx` | Wraps every input: label with red `*`, helper text, error message, and the `12/60` counter. Marks itself `data-field-error` so the form can scroll to it. |
| `InputField.tsx` | `text`, `url` and `number`. Numbers keep digits only and store a real number. |
| `TextAreaField.tsx` | `textarea` with character counter. |
| `PickerField.tsx` | `select` (one choice) and `multiselect` (many). Shows a button that looks like an input and opens `OptionPicker`. |
| `PickerButton.tsx` | The input-looking button with a chevron. |
| `OptionPicker.tsx` | The list UI from the screenshots. Short single list: **bottom sheet** with radio buttons. Searchable list: **full screen** with "Find ..." box. Multiple choice: full screen with **Clear / Select**. Splits into **Popular** and **Other** sections when options are marked popular. |
| `RadioField.tsx` | `radio`: a few side-by-side choices (Yes / No / Not sure). |
| `CheckboxField.tsx` | `checkbox` (Service Charge). |
| `LocationField.tsx` | `location`: pick a state, then a locality. Stores `stateCode`, `stateName`, `lgaName`. Reuses the existing `useStates` and `useLgas` hooks. |
| `PhotosField.tsx` | `photos`: add, remove, **drag to reorder**, and a star button to make a photo the title picture (drag does not work on phones, the star does). Checks format, size and count as files are picked. Photos stay in the browser until the ad is posted. |
| `ContactInfo.tsx` | Read-only name and phone from the user's profile. |

### Logic without React (`src/lib/post-ad/`)

| File | Purpose |
|---|---|
| `formHelpers.ts` | `buildDefaultValues` (starting values), `buildPayload` (form values to request body: nested keys, empty answers left out, photos left out), `buildRules` (field description to React Hook Form rules), `getByPath` / `setByPath` (dotted keys). |
| `photoHelpers.ts` | `checkNewPhotos` (format/size/count rules with readable messages), `moveItem` (reorder), `toAcceptAttribute` (for the file input). |

### API layer

| File | Purpose |
|---|---|
| `src/types/listing.ts` | TypeScript types for the form description, categories and listings. |
| `src/services/listingService.ts` | The API calls (`getPostableCategories`, `getForm`, `createListing`, `updateListing`, `uploadImages`, `publishListing`, `getMyListings`). Returns the unwrapped `data`. |
| `src/hooks/listings/listingKeys.ts` | React Query cache keys. |
| `src/hooks/listings/queries/` | `useGetPostableCategories`, `useGetListingForm`, `useGetMyListings`. |
| `src/hooks/listings/mutations/` | `useCreateListing`, `useUpdateListing`, `useUploadListingImages`, `usePublishListing`. |
| `src/hooks/listings/custom/usePostAdSubmit.ts` | Runs the three steps (draft, photos, publish). It **remembers what already succeeded**, so if the photo upload fails, pressing "Post ad" again does not create a second draft. Errors go through `handleAxiosError`, which puts server messages under the right field. |
| `src/lib/utils/formatNaira.ts` | `1500000` becomes `₦1,500,000`. |

### Existing files that were edited

| File | Change |
|---|---|
| `src/App.tsx` | Routes `/post-ad`, `/post-ad/:categoryId`, `/my-ads` (inside the login-protected group). |
| `src/components/AppLayout.tsx` | Hides the bottom nav on `/post-ad/...` so the long form and pickers are full screen. |
| `src/pages/Profile.tsx` | "Post an ad" and "My ads" links. |

---

## 3. How to add things

### A new category (cars, phones, ...)
Nothing to do here. Add the category on the backend (see the API README). It appears in
`ChooseCategory` and its form is drawn by `DynamicField`.

### A new kind of input (for example a date picker)
1. Backend: add the type to `FormFieldType`.
2. `src/types/listing.ts`: add the same word to `FormFieldType`.
3. Create `components/post-ad/DateField.tsx`. Copy `TextAreaField.tsx` as a starting point:
   wrap in `FieldShell`, use `Controller` with `name={field.key}` and `rules={buildRules(field)}`.
4. Add a `case "date":` in `DynamicField.tsx`.
5. If it needs special rules, add them in `buildRules` (`formHelpers.ts`).
6. If its value is not sent as-is, handle it in `buildDefaultValues` / `buildPayload`.

### A change to the look of the pickers
Everything visual about lists is in `OptionPicker.tsx`; the input-like button is `PickerButton.tsx`.

### Editing an existing ad (not built yet)
The API supports it already. Suggested steps:
1. Route `/my-ads/:id/edit` reusing `PostAdFormBody` with default values taken from the listing
   (`details` already has the same keys as the form).
2. Use `useUpdateListing` for the fields.
3. For photos, call the existing image endpoints (delete, reorder, add) from `PhotosField`.

---

## 4. Things to know

- Form values live in React Hook Form. Dotted keys such as `details.address` become nested objects automatically.
- Empty optional answers are **not sent**, because the API treats a missing field as "not provided" and rejects an empty string for an option.
- Photos are not part of the JSON request; `buildPayload` skips them and `usePostAdSubmit` uploads them as a separate multipart request.
- The client rules only give quick feedback. The server is the real validator, and its messages are mapped back onto the right field.
- HEIC photos cannot be previewed in every browser, so a placeholder icon is shown; they still upload.

## 5. Verified how, and what is left

This was written without being able to install React and the other libraries, so it was
type-checked against loose stand-ins and its logic was tested separately (form helpers,
photo rules, and a test that checks the request it builds against what the backend accepts).
Run `npm run build` and `npm run lint`, then try the flow in a browser: choose category,
fill the form, add 5 photos, post, and check `/my-ads`.

## 6. Moderation, detail pages and the homepage

| Where | File |
|---|---|
| Homepage/Listings page choose products or ads | `hooks/listings/custom/useMarketFeed.ts` (ads when the selected category is an ad category), `components/ui/productGrid.tsx` (`kind`), `components/ads/AdCard.tsx` |
| Public ad page `/ad/:slug` | `pages/ads/AdDetail.tsx` |
| Owner ad page `/my-ads/:id` (status, rejection reason, resubmit, pause, delete) | `pages/post-ad/MyAdDetail.tsx` |
| Owner edit `/my-ads/:id/edit` | `pages/post-ad/EditAd.tsx` + `components/post-ad/AdEditForm.tsx` + `EditPhotos.tsx` |
| Shared ad body (photos, price, details, description) | `components/ads/AdDetailsView.tsx`, `lib/post-ad/detailRows.ts` |
| Status names/colours | `lib/post-ad/adStatus.ts`, `components/ads/AdStatusBadge.tsx` |
| Admin `/admin/ads`, `/admin/ads/:id`, `/admin/ads/:id/edit` | `pages/admin/ads/*`, `components/admin/ads/RejectAdDialog.tsx`, `hooks/admin/ads/*`, `services/adminAdsService.ts` |

Posting now submits the ad for review. Editing a live ad sends it back to review (the edit page warns about it). `AdEditForm` is shared by the owner and the admin; each passes its own `PhotoActions` (admins cannot add photos).

### Seller dashboard and homepage (products + ads)

- `/seller-dashboard/manage-listings` has two tabs: **My ads** (`components/ads/SellerAds.tsx`, status filter, links to `/my-ads/:id`) and **Older products** (the previous product list, edit and delete still work). "Post ad" replaces "Add new"; `/seller-dashboard/create-listing` redirects to `/post-ad`. Editing an old product still uses `CreateListing` at `/seller-dashboard/edit-listing/:id`.
- The homepage and `/listings` use `hooks/listings/custom/useMarketFeed.ts`: published ads first, then older products, same filters. `ProductGrid` draws each item by its `kind`.

### Public ad page, reviews, saving, and who can post

- `/ad/:slug` (`pages/ads/AdDetail.tsx`) mirrors the product page: rating, price, Chat Seller / WhatsApp / Call, Save, seller card, reviews. It passes the ad id where product pages pass the product id (the backend accepts both) in `useGetSaveStatus`, `useToggleSavedProduct`, `useCreateInteraction` and `ReviewsSection`.
- `/ad/:slug/review` uses the same `WriteReview` page (it checks the URL to know it is an ad).
- `pages/Saved.tsx` also shows saved ads (`useGetSavedAds`).
- `components/post-ad/SellerGate.tsx` wraps `/post-ad` and `/post-ad/:categoryId`: signed-out users see the sign-in prompt, non-sellers see "Only sellers can post ads" with a Become a seller button. The backend enforces the same rule.
