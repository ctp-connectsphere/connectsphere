# Next Phase: Core User Features

**Current Status:** ✅ Authentication Complete | 🚧 **Next: User Onboarding**

> **📚 Full Roadmap:** See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for the complete 32-issue roadmap across all 8 phases.

---

## 🎯 What's Next: Phase 4 - Core User Features

Now that authentication is complete, users need to set up their profiles so they can find study partners. This phase focuses on **onboarding** - helping users complete their profile with essential matching data.

**This is a focused guide for Phase 4.** For the complete implementation roadmap with all phases, see [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md).

---

## 📋 Priority Order

### 1. **User Profile Management** (Start Here!)

**Goal:** Let users create and edit their profile

**What to Build:**

- Profile creation/edit page
- Form fields: bio, study preferences (location, style, pace)
- Profile image upload (Cloudinary integration)
- Profile completion tracking
- Profile display component

**Why First?**

- Users need to complete their profile before matching
- Foundation for all other features
- Simple to implement and test

**Estimated Time:** 2-3 days

---

### 2. **Course Management System**

**Goal:** Let users search and enroll in courses

**What to Build:**

- Course search and filtering
- Course enrollment UI
- User's enrolled courses list
- Course validation (prevent duplicates)
- Integration with University model

**Why Second?**

- Matching algorithm needs course data
- Users must enroll before finding partners
- Builds on profile foundation

**Estimated Time:** 2-3 days

---

### 3. **Availability Scheduling**

**Goal:** Let users set their weekly study availability

**What to Build:**

- Weekly availability grid (7 days × time slots)
- Time slot selection interface
- Availability management (add/edit/delete)
- Availability validation
- Visual calendar component

**Why Third?**

- Matching algorithm needs availability data
- Final piece of matching data
- Most complex UI component

**Estimated Time:** 2-3 days

---

### 4. **Enhanced Dashboard**

**Goal:** Improve dashboard with profile status and quick actions

**What to Build:**

- Profile completion indicator
- Course enrollment summary
- Availability preview
- Quick action buttons
- Onboarding progress tracker

**Why Last?**

- Pulls everything together
- Shows completion status
- Guides users through setup

**Estimated Time:** 1-2 days

---

## 🗂️ Database Models Ready

Your Prisma schema already has all the models you need:

✅ **UserProfile** - Profile data (bio, preferences)  
✅ **Course** - Course catalog  
✅ **UserCourse** - User enrollments  
✅ **Availability** - Weekly time slots  
✅ **University** - University data

**No schema changes needed!** Just build the UI and Server Actions.

---

## 🚀 Implementation Strategy

### Step 1: Start with Profile (Easiest)

1. Create `src/app/(dashboard)/profile/page.tsx`
2. Create `src/lib/actions/profile.ts` (Server Actions)
3. Build form with validation
4. Add image upload (Cloudinary)
5. Test create/edit flow

### Step 2: Add Courses

1. Create `src/app/(dashboard)/courses/page.tsx`
2. Create `src/lib/actions/courses.ts` (Server Actions)
3. Build search/filter UI
4. Add enrollment functionality
5. Display enrolled courses

### Step 3: Build Availability

1. Create `src/app/(dashboard)/availability/page.tsx`
2. Create `src/lib/actions/availability.ts` (Server Actions)
3. Build weekly grid component
4. Add time slot management
5. Visual calendar interface

### Step 4: Enhance Dashboard

1. Update `src/app/(dashboard)/dashboard/page.tsx`
2. Add completion indicators
3. Show profile summary
4. Add quick navigation

---

## 📁 Files to Create

### Profile Management

```
src/app/(dashboard)/profile/
  ├── page.tsx                    # Profile page
  └── edit/page.tsx               # Edit profile (optional)

src/lib/actions/
  └── profile.ts                   # Profile Server Actions

src/components/profile/
  ├── profile-form.tsx            # Profile form component
  ├── profile-display.tsx         # Profile display
  └── profile-image-upload.tsx    # Image upload
```

### Course Management

```
src/app/(dashboard)/courses/
  ├── page.tsx                    # Course search/enrollment
  └── my-courses/page.tsx         # Enrolled courses list

src/lib/actions/
  └── courses.ts                  # Course Server Actions

src/components/courses/
  ├── course-search.tsx           # Search component
  ├── course-card.tsx             # Course display
  └── enrolled-courses.tsx        # Enrolled list
```

### Availability

```
src/app/(dashboard)/availability/
  └── page.tsx                    # Availability grid

src/lib/actions/
  └── availability.ts             # Availability Server Actions

src/components/availability/
  ├── availability-grid.tsx       # Weekly grid
  ├── time-slot.tsx              # Time slot component
  └── availability-calendar.tsx    # Calendar view
```

---

## 🎨 UI/UX Considerations

### Profile Page

- **Form-first approach** - Simple form, clear fields
- **Image upload** - Drag & drop or click to upload
- **Progress indicator** - Show completion percentage
- **Save feedback** - Clear success/error messages

### Course Page

- **Search bar** - Prominent, easy to find
- **Filter options** - By semester, department, instructor
- **Course cards** - Show code, name, section, instructor
- **Enrollment button** - Clear CTA
- **My courses** - Separate tab/list

### Availability Page

- **Visual grid** - 7 days × time slots
- **Click to toggle** - Simple interaction
- **Color coding** - Available vs. unavailable
- **Bulk actions** - Select multiple slots
- **Time range** - Customizable start/end times

---

## ✅ Acceptance Criteria

### Profile

- [ ] Users can create profile after registration
- [ ] Profile can be edited anytime
- [ ] Image upload works (Cloudinary)
- [ ] All fields save correctly
- [ ] Profile completion is tracked

### Courses

- [ ] Users can search courses
- [ ] Search filters work (semester, department)
- [ ] Users can enroll in courses
- [ ] Duplicate enrollment prevented
- [ ] Enrolled courses list works

### Availability

- [ ] Users can set weekly availability
- [ ] Time slots can be selected
- [ ] Availability saves correctly
- [ ] Multiple slots can be set
- [ ] Visual calendar displays correctly

---

## 🔗 Dependencies

### External Services Needed

- **Cloudinary** - For profile image uploads
  - Already in config, just need to implement
  - See `src/lib/config/env.ts` for `STORAGE_CONFIG`

### Database

- ✅ All models exist in schema
- ✅ Relationships are set up
- Just need to seed some sample courses/universities

---

## 📊 Estimated Timeline

**Total: 8-11 days**

- Profile: 2-3 days
- Courses: 2-3 days
- Availability: 2-3 days
- Dashboard: 1-2 days

**If working solo:** ~2 weeks  
**If working with team:** 1 week (parallel work)

---

## 🎯 Success Metrics

After completing this phase, users should be able to:

1. ✅ Complete their profile
2. ✅ Enroll in courses
3. ✅ Set their availability
4. ✅ See their progress on dashboard

**Ready for Phase 5:** Matching Algorithm (finds partners based on profile + courses + availability)

---

## 💡 Pro Tips

1. **Start Simple** - Build basic forms first, enhance later
2. **Reuse Components** - Create reusable UI components
3. **Validate Early** - Add validation from the start
4. **Test Often** - Test each feature before moving on
5. **Document** - Update docs as you build

---

## 🚦 Ready to Start?

**Recommended First Task:**

1. Create profile page structure
2. Build basic profile form
3. Implement Server Action for saving
4. Test create/edit flow
5. Add image upload

**Need help?** Check:

- `docs/API_REFERENCE.md` - Server Action patterns
- `docs/TECHNICAL_DOCUMENTATION.md` - Architecture
- Existing auth code - Similar patterns

---

_Last Updated: Nov. 2025_  
_Next Phase Roadmap v1.0_
