const getCandidatesQuery = (selectFields) => {
  const { limit, offset, user_id, q } = selectFields;

  const select = [];
  const selectPagination = []
  const values = [];
  const valuesDefect = [];

  let selectQuery;

  // Añadir valores defecto solo si existen en selectFields
  if (user_id !== undefined) valuesDefect.push(user_id);
  if (q !== undefined) valuesDefect.push(q);

  valuesDefect.push(limit, offset)

  for (const key in selectFields) {
    if (key !== 'user_id' && key !== 'q' && key !== 'limit' && key !== 'offset') {
      select.push(`AND ${key} = $${values.length + 5}`);
      values.push(selectFields[key]);
      selectPagination.push(`AND ${key} = $${values.length}`)

    }
  }


  if (select.length === 0) {
    selectQuery = `
      SELECT 
        c.candidate_id,
        c.first_name,
        c.last_name,
        c.age,
        c.phone_number,
        c.has_own_transport,
        c.has_work_experience,
        e.education,
        av.availability_schedule,
        c.upload_date,
        c.user_id,
        c.cuil,
        l.name AS location,
        cs.name AS status,
        cv.link AS cv_link,
        po.current_position
      FROM 
        public."Candidates" c
      LEFT JOIN 
        public."Cvs" cv ON c.candidate_id = cv.candidate_id
      LEFT JOIN 
        public."Education" e ON c.education_id = e.education_id
      LEFT JOIN 
        public."Availability" av ON c.availability_id = av.availability_id
      LEFT JOIN 
        public."Positions" po ON c.current_position_id = po.current_position_id
      LEFT JOIN 
        public."CandidateStatus" cs ON c.status_id = cs.status_id
      LEFT JOIN 
        public."Location" l ON c.location_id = l.location_id
      WHERE 
        c.user_id = $1
        AND (c.first_name ILIKE '%' || $2 || '%' OR c.last_name ILIKE '%' || $2 || '%' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $2 || '%')
      ORDER BY c.upload_date DESC
      LIMIT $3 OFFSET $4
    `;
  } else {

    selectQuery = `
      SELECT 
        c.candidate_id,
        c.first_name,
        c.last_name,
        c.age,
        c.phone_number,
        c.has_own_transport,
        c.has_work_experience,
        e.education,
        av.availability_schedule,
        c.upload_date,
        c.user_id,
        c.cuil,
        l.name AS location,
        cs.name AS status,
        cv.link AS cv_link,
        po.current_position
      FROM 
        public."Candidates" c
      LEFT JOIN 
        public."Cvs" cv ON c.candidate_id = cv.candidate_id
      LEFT JOIN 
        public."Education" e ON c.education_id = e.education_id
      LEFT JOIN 
        public."Availability" av ON c.availability_id = av.availability_id
      LEFT JOIN 
        public."Positions" po ON c.current_position_id = po.current_position_id
      LEFT JOIN 
        public."CandidateStatus" cs ON c.status_id = cs.status_id
      LEFT JOIN 
        public."Location" l ON c.location_id = l.location_id
      WHERE 
        c.user_id = $1
        AND (c.first_name ILIKE '%' || $2 || '%' OR c.last_name ILIKE '%' || $2 || '%' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $2 || '%')
        ${select.join(' ')}
      ORDER BY c.upload_date DESC
      LIMIT $3 OFFSET $4
    `;
  }

  const combinedValues = [...valuesDefect, ...values];


  const totalPagesQuery = `
  WITH filtered_candidates AS (
    SELECT 
      c.candidate_id,
      c.first_name,
      c.last_name,
      c.age,
      c.phone_number,
      c.has_own_transport,
      c.has_work_experience,
      e.education,
      av.availability_schedule,
      c.upload_date,
      c.user_id,
      c.cuil,
      l.name AS location,
      cs.name AS status,
      cv.link AS cv_link,
      po.current_position
    FROM 
      public."Candidates" c
    LEFT JOIN 
      public."Cvs" cv ON c.candidate_id = cv.candidate_id
    LEFT JOIN 
      public."Education" e ON c.education_id = e.education_id
    LEFT JOIN 
      public."Availability" av ON c.availability_id = av.availability_id
    LEFT JOIN 
      public."Positions" po ON c.current_position_id = po.current_position_id
    LEFT JOIN 
      public."CandidateStatus" cs ON c.status_id = cs.status_id
    LEFT JOIN 
      public."Location" l ON c.location_id = l.location_id
    WHERE 
      c.user_id = ${user_id}
      AND (c.first_name ILIKE '%' || '${q}' || '%' OR c.last_name ILIKE '%' || '${q}' || '%' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || '${q}' || '%')
      ${selectPagination.join(' ')}
    )
    SELECT CEIL(COUNT(*)::float / ${limit}) AS total_pages
    FROM filtered_candidates
    `;


  return { selectQuery, combinedValues, totalPagesQuery, values };
};

module.exports = { getCandidatesQuery };
