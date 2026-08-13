#!/bin/bash
cd ~/USAM-Learning-Worlds/backend/src

# Fix all prisma import paths
find . -type f -name "*.ts" -exec sed -i "s|from '../../../core/prisma/prisma.service'|from '../../../database/prisma.service'|g" {} \;
find . -type f -name "*.ts" -exec sed -i "s|from '../../core/prisma/prisma.service'|from '../../database/prisma.service'|g" {} \;
find . -type f -name "*.ts" -exec sed -i "s|from '../../../core/prisma/prisma.module'|from '../../../database/database.module'|g" {} \;
find . -type f -name "*.ts" -exec sed -i "s|from '../../core/prisma/prisma.module'|from '../../database/database.module'|g" {} \;

# Fix JwtAuthGuard imports
find . -type f -name "*.ts" -exec sed -i "s|from '../auth/jwt-auth.guard'|from '../auth/guards/jwt-auth.guard'|g" {} \;

# Fix space in variable name
sed -i 's/const mastery Summary/const masterySummary/g' modules/ai/learner-context.service.ts

# Fix character controller - remove prisma access
sed -i 's/this\.characterService\.prisma\.character\.findMany/this.characterService.findAllCharacters/g' modules/ai/character.controller.ts
sed -i 's/where: {$/role: role as any,/g' modules/ai/character.controller.ts | head -5

# Fix optional parameters
sed -i 's/@Request() req: any,/@Request() req?: any,/g' modules/ai/character.controller.ts
sed -i 's/@Request() req: any)/@Request() req?: any)/g' modules/ai/character.controller.ts

echo "✅ Import paths fixed"
